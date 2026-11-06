import React from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  AlertCircle,
  Sparkles,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PaymentModal({
  isOpen,
  onClose,
  course,
  targetItem,
}) {
  const { user } = useAuth();

  if (!isOpen || !course) return null;

  const price = course.price || 499;

  return (
    <div className="payment-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="payment-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="payment-header">
          <div className="payment-badge-tag">
            <Sparkles size={14} />
            <span>Course Access Required</span>
          </div>

          <h2 className="payment-title">
            Unlock Full Syllabus & Materials
          </h2>

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
            <span className="price-amount">₹{price}</span>
          </div>
          <div className="price-divider" />
          <div className="price-row total">
            <span>Total Payable</span>
            <span className="price-total-amount">₹{price}</span>
          </div>
        </div>

        <div className="gateway-status test">
          <AlertCircle size={16} color="#f59e0b" />
          <div>
            <strong>Secure payment setup pending</strong>
            <p>
              Payments are temporarily unavailable. A server-side payment
              order and payment verification service must be configured
              before course access can be granted.
            </p>
          </div>
        </div>

        <div className="payment-actions">
          <button
            className="btn-pay-razorpay"
            type="button"
            disabled
          >
            <Lock size={16} />
            <span>Payment temporarily unavailable</span>
          </button>
        </div>

        <div className="payment-security-footer">
          <div className="security-item">
            <ShieldCheck size={14} />
            <span>Payment verification required</span>
          </div>
          <div className="security-item">
            <Lock size={14} />
            <span>Resource protection pending backend setup</span>
          </div>
        </div>

        <p className="payment-subtitle">
          Account: {user?.email || 'Not signed in'}
        </p>
      </div>
    </div>
  );
}
