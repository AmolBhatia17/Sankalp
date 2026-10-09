import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  Video,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Helper to dynamically inject Razorpay checkout.js script
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
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
  onPaymentSuccess,
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const isRazorpayConfigured = Boolean(
    razorpayKey && razorpayKey !== 'your_razorpay_key_id_here' && razorpayKey.startsWith('rzp_')
  );

  useEffect(() => {
    if (isOpen) {
      setError('');
      loadRazorpayScript();
    }
  }, [isOpen]);

  if (!isOpen || !course) return null;

  const handleRazorpayPayment = async () => {
    setLoading(true);
    setError('');

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      setError('Unable to initialize Razorpay checkout. Please check your internet connection.');
      setLoading(false);
      return;
    }

    try {
      const options = {
        key: razorpayKey,
        amount: (course.price || 499) * 100, // Amount in paise
        currency: 'INR',
        name: 'Sankalp Education',
        description: `Enrollment: ${course.title}`,
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&auto=format&fit=crop',
        prefill: {
          name: user?.displayName || '',
          email: user?.email || '',
          contact: phone || '',
        },
        theme: {
          color: '#059669', // Emerald accent
        },
        handler: function (response) {
          setLoading(false);
          onPaymentSuccess?.({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            amount: course.price,
          });
          onClose();
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('Razorpay payment error:', err);
      setError('Payment gateway error. Please try again.');
      setLoading(false);
    }
  };

  const handleSimulatedPayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onPaymentSuccess?.({
        paymentId: `pay_test_${Date.now().toString(36)}`,
        orderId: `order_test_${Date.now().toString(36)}`,
        amount: course.price,
      });
      onClose();
    }, 900);
  };

  return (
    <div className="payment-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="payment-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="payment-header">
          <div className="payment-badge-tag">
            <Sparkles size={14} />
            <span>Course Access Required</span>
          </div>
          <h2 className="payment-title">Unlock Full Syllabus & Materials</h2>
          <p className="payment-subtitle">
            Secure enrollment is required to access official PDF spec sheets, CAD drawings, and slide decks for <strong>{course.title}</strong>.
          </p>
        </div>

        {/* Target Item Hint (if user clicked a specific PDF/PPTX) */}
        {targetItem && (
          <div className="payment-target-preview">
            <div className="target-icon">
              {targetItem.type === 'pdf' ? <FileText size={18} color="#ef4444" /> : <FileText size={18} color="#f97316" />}
            </div>
            <div className="target-details">
              <span className="target-label">Requested Document</span>
              <span className="target-filename">{targetItem.file || targetItem.name || targetItem.title}</span>
            </div>
            <Lock size={16} className="target-lock" />
          </div>
        )}

        {/* What's Included Card */}
        <div className="payment-benefits-card">
          <h4 className="benefits-title">What you'll get with enrollment:</h4>
          <ul className="benefits-list">
            <li>
              <CheckCircle2 size={16} color="#34d399" />
              <span>Full access to all {course.modulesCount || 5} module presentation decks (.pptx)</span>
            </li>
            <li>
              <CheckCircle2 size={16} color="#34d399" />
              <span>Downloadable 2D/3D mechanical drawings & PDF specification sheets</span>
            </li>
            <li>
              <CheckCircle2 size={16} color="#34d399" />
              <span>Structured video lecture series aligned with academic exams</span>
            </li>
            <li>
              <CheckCircle2 size={16} color="#34d399" />
              <span>Lifetime access on account <strong>{user?.email}</strong></span>
            </li>
          </ul>
        </div>

        {/* Price & Billing Summary */}
        <div className="payment-price-box">
          <div className="price-row">
            <span>Course Fee ({course.title})</span>
            <span className="price-amount">₹{course.price || 499}</span>
          </div>
          <div className="price-row secondary">
            <span>Access Term</span>
            <span>Lifetime Academic Access</span>
          </div>
          <div className="price-divider" />
          <div className="price-row total">
            <span>Total Payable</span>
            <span className="price-total-amount">₹{course.price || 499}</span>
          </div>
        </div>

        {/* Gateway Notice / Status */}
        {isRazorpayConfigured ? (
          <div className="gateway-status live">
            <ShieldCheck size={16} color="#34d399" />
            <span>Secured with Razorpay 256-bit SSL Payment Gateway</span>
          </div>
        ) : (
          <div className="gateway-status test">
            <AlertCircle size={16} color="#f59e0b" />
            <div>
              <strong>Razorpay Sandbox / Test Mode</strong>
              <p>Key ID not yet detected in .env. You can simulate instant unlock or connect your Razorpay Key ID.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="payment-error-box">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="payment-actions">
          {isRazorpayConfigured ? (
            <button
              className="btn-pay-razorpay"
              onClick={handleRazorpayPayment}
              disabled={loading}
            >
              {loading ? (
                <span className="payment-spinner" />
              ) : (
                <>
                  <Lock size={16} />
                  <span>Pay ₹{course.price || 499} via Razorpay</span>
                </>
              )}
            </button>
          ) : (
            <div className="dual-pay-buttons">
              <button
                className="btn-pay-razorpay"
                onClick={handleSimulatedPayment}
                disabled={loading}
              >
                {loading ? (
                  <span className="payment-spinner" />
                ) : (
                  <>
                    <CreditCard size={16} />
                    <span>Simulate Test Payment (Unlock Now)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Security Trust Badges */}
        <div className="payment-security-footer">
          <div className="security-item">
            <ShieldCheck size={14} />
            <span>100% Secure Payment</span>
          </div>
          <div className="security-item">
            <Lock size={14} />
            <span>Encrypted Checkout</span>
          </div>
          <div className="security-item">
            <CheckCircle2 size={14} />
            <span>Instant Unlocking</span>
          </div>
        </div>
      </div>
    </div>
  );
}
