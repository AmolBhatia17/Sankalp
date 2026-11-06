import { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  AlertCircle,
  Sparkles,
  FileText,
  Loader2,
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/useAuth';
import { app } from '../firebase/firebaseConfig';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT}"]`
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentModal({
  isOpen,
  onClose,
  course,
  targetItem,
}) {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !course) return null;

  const price = Number(course.price);

  const handlePayment = async () => {
    if (!user) {
      setError('Please sign in before making a payment.');
      return;
    }

    if (!app || !Number.isSafeInteger(price) || price <= 0) {
      setError('Payment is not configured correctly. Please contact support.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Unable to load Razorpay Checkout. Check your connection.');
      }

      const functions = getFunctions(app, 'asia-south1');
      const createOrder = httpsCallable(functions, 'createRazorpayOrder');
      const verifyPayment = httpsCallable(functions, 'verifyRazorpayPayment');

      const orderResponse = await createOrder({ courseId: course.id });
      const order = orderResponse.data;

      if (!order?.orderId || !order?.keyId || !order?.amount) {
        throw new Error('The server returned an invalid payment order.');
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Sankalp',
        description: `Enrollment: ${order.courseName || course.title}`,
        order_id: order.orderId,
        prefill: {
          email: user.email || '',
        },
        notes: {
          courseId: course.id,
        },
        theme: {
          color: '#2563eb',
        },
        handler: async (response) => {
          try {
            setProcessing(true);

            const verification = await verifyPayment({
              courseId: course.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!verification.data?.success || !verification.data?.enrolled) {
              throw new Error('Payment verification was not completed.');
            }

            onClose?.();
          } catch (verificationError) {
            console.error('Payment verification failed:', verificationError);
            setError(
              verificationError.message ||
              'Payment verification failed. Please contact support with your payment ID.'
            );
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      });

      checkout.on('payment.failed', (response) => {
        setError(
          response.error?.description ||
          'Payment failed. Please try again.'
        );
        setProcessing(false);
      });

      checkout.open();
    } catch (paymentError) {
      console.error('Payment initiation failed:', paymentError);
      setError(
        paymentError.message ||
        'Unable to start payment. Please try again.'
      );
      setProcessing(false);
    }
  };

  return (
    <div className="payment-overlay" onClick={processing ? undefined : onClose}>
      <div className="payment-modal" onClick={(event) => event.stopPropagation()}>
        <button
          className="payment-close-btn"
          onClick={onClose}
          aria-label="Close modal"
          disabled={processing}
        >
          <X size={20} />
        </button>

        <div className="payment-header">
          <div className="payment-badge-tag">
            <Sparkles size={14} />
            <span>Course Access Required</span>
          </div>

          <h2 className="payment-title">Unlock Full Syllabus & Materials</h2>

          <p className="payment-subtitle">
            Enrollment is required to access the course materials for{' '}
            <strong>{course.title}</strong>.
          </p>
        </div>

        {targetItem && (
          <div className="payment-target-preview">
            <div className="target-icon">
              <FileText size={18} />
            </div>
            <div className="target-details">
              <span className="target-label">Requested Document</span>
              <span className="target-filename">
                {targetItem.file || targetItem.name || targetItem.title}
              </span>
            </div>
            <Lock size={16} className="target-lock" />
          </div>
        )}

        <div className="payment-price-box">
          <div className="price-row">
            <span>Course Fee ({course.title})</span>
            <span className="price-amount">
              {Number.isSafeInteger(price) && price > 0 ? `₹${price}` : 'Unavailable'}
            </span>
          </div>
          <div className="price-divider" />
          <div className="price-row total">
            <span>Total Payable</span>
            <span className="price-total-amount">
              {Number.isSafeInteger(price) && price > 0 ? `₹${price}` : 'Unavailable'}
            </span>
          </div>
        </div>

        {error && (
          <div className="gateway-status test" role="alert">
            <AlertCircle size={16} color="#dc2626" />
            <div>
              <strong>Payment issue</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="payment-actions">
          <button
            className="btn-pay-razorpay"
            type="button"
            onClick={handlePayment}
            disabled={processing || !user || !Number.isSafeInteger(price) || price <= 0}
          >
            {processing ? <Loader2 size={16} className="spin" /> : <Lock size={16} />}
            <span>{processing ? 'Processing…' : 'Pay securely with Razorpay'}</span>
          </button>
        </div>

        <div className="payment-security-footer">
          <div className="security-item">
            <ShieldCheck size={14} />
            <span>Server-verified payment</span>
          </div>
          <div className="security-item">
            <Lock size={14} />
            <span>Enrollment granted after verification</span>
          </div>
        </div>

        <p className="payment-subtitle">
          Account: {user?.email || 'Not signed in'}
        </p>
      </div>
    </div>
  );
}
