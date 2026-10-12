import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createEnrollment } from '../lib/enrollments';
import { Icon } from './ui';
import { formatINR } from '../lib/format';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
const isRazorpayConfigured = Boolean(RAZORPAY_KEY && RAZORPAY_KEY.startsWith('rzp_'));

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentModal({ isOpen, onClose, course, onSuccess }) {
  const { user, displayName } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !course) return null;

  const price = course.price || 0;

  const recordEnrollment = (payment = {}) =>
    createEnrollment(user.uid, course.id, {
      userEmail: user.email,
      amount: price,
      paymentId: payment.paymentId,
      orderId: payment.orderId,
    });

  const handlePay = async () => {
    setError('');
    if (!user) {
      setError('Please sign in to enroll.');
      return;
    }
    setLoading(true);

    try {
      // No gateway key configured — record entitlement directly (dev only).
      if (!isRazorpayConfigured) {
        await recordEnrollment({ paymentId: `dev_${Date.now()}`, orderId: '' });
        onSuccess?.();
        onClose();
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error('Could not load the Razorpay checkout. Check your connection.');
      }

      const orderRes = await fetch(`${API_BASE}/razorpay/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: price, courseId: course.id }),
      });
      if (!orderRes.ok) {
        throw new Error('Could not create the payment order. Is the payment server running?');
      }
      const order = await orderRes.json();

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: RAZORPAY_KEY,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'Sankalp',
          description: `Enrollment: ${course.title}`,
          order_id: order.orderId,
          prefill: { name: displayName || '', email: user.email || '' },
          theme: { color: '#3525cd' },
          handler: async (response) => {
            try {
              const verifyRes = await fetch(`${API_BASE}/razorpay/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                }),
              });
              const verified = await verifyRes.json();
              if (!verifyRes.ok || !verified.verified) {
                throw new Error('Payment signature verification failed.');
              }
              await recordEnrollment({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
              });
              onSuccess?.();
              onClose();
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled.')) },
        });
        rzp.on('payment.failed', (resp) =>
          reject(new Error(resp?.error?.description || 'Payment failed.'))
        );
        rzp.open();
      });
    } catch (err) {
      setError(err.message || 'Payment could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse/60 p-4 backdrop-blur-sm animate-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Complete enrollment"
        className="custom-scrollbar max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-line bg-card p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-primary-accent">
              <Icon name="lock" className="text-sm" /> Enrollment required
            </span>
            <h2 className="mt-3 font-display text-xl font-bold">Unlock full course access</h2>
          </div>
          <button onClick={onClose} aria-label="Close">
            <Icon name="close" className="text-on-surface-variant" />
          </button>
        </div>

        <p className="text-sm text-on-surface-variant">
          Get lifetime access to every lecture, lab and downloadable resource for{' '}
          <strong className="text-on-surface">{course.title}</strong>.
        </p>

        <div className="mt-5 rounded-2xl border border-line bg-surface-low p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">Course fee</span>
            <span className="font-display text-lg font-bold text-primary-accent">{formatINR(price)}</span>
          </div>
          {course.originalPrice > price && (
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">Academic grant applied</span>
              <span className="font-semibold text-secondary">
                −{formatINR(course.originalPrice - price)}
              </span>
            </div>
          )}
          <div className="my-3 h-px bg-surface-highest" />
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Total payable</span>
            <span>{formatINR(price)}</span>
          </div>
        </div>

        {user?.email && (
          <p className="mt-3 text-xs text-on-surface-variant">
            Access will be linked to <strong>{user.email}</strong>.
          </p>
        )}

        {!isRazorpayConfigured && (
          <div className="mt-4 flex gap-2 rounded-xl bg-warn-container px-3 py-2 text-xs text-warn">
            <Icon name="info" className="text-base" />
            <span>Razorpay key not configured — enrolling will record access directly (dev mode).</span>
          </div>
        )}

        {error && (
          <div className="mt-4 flex gap-2 rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            <Icon name="error" className="text-base" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
        >
          <Icon name="lock" className="text-base" />
          {loading ? 'Processing…' : `Pay ${formatINR(price)} securely`}
        </button>

        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1">
            <Icon name="shield" className="text-sm" /> Secure
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="encrypted" className="text-sm" /> Encrypted
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="bolt" className="text-sm" /> Instant access
          </span>
        </div>
      </div>
    </div>
  );
}
