import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../ui';

const emptyForm = { name: '', email: '', institution: '', grantType: 'full', researchInterest: '' };

export default function FellowshipModal({ isOpen, onClose }) {
  const { user, displayName } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await addDoc(collection(db, 'applications'), {
        ...form,
        uid: user?.uid || null,
        type: 'fellowship',
        status: 'submitted',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Fellowship application failed:', err);
      setError('Could not submit your application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-line-strong bg-card px-4 py-3 text-sm outline-none transition focus:border-primary-hover focus:ring-2 focus:ring-primary-hover/30';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse/60 p-4 backdrop-blur-sm animate-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Fellowship application"
        className="custom-scrollbar max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-line bg-card p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container/40 text-secondary">
              <Icon name="check_circle" fill className="text-3xl" />
            </div>
            <h3 className="font-display text-xl font-bold">Application received</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              Our academic office will review your fellowship application and respond by email.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-bold">Apply for a fellowship</h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Full, partial and lab grants are available to eligible students.
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close">
                <Icon name="close" className="text-on-surface-variant" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                required
                placeholder="Full name"
                value={form.name || displayName}
                onChange={set('name')}
                className={inputCls}
              />
              <input
                required
                type="email"
                placeholder="Email address"
                value={form.email || user?.email || ''}
                onChange={set('email')}
                className={inputCls}
              />
              <input
                required
                placeholder="Institution / University"
                value={form.institution}
                onChange={set('institution')}
                className={inputCls}
              />
              <select value={form.grantType} onChange={set('grantType')} className={inputCls}>
                <option value="full">Full academic grant</option>
                <option value="partial">Partial grant</option>
                <option value="lab">Lab / equipment grant</option>
              </select>
              <textarea
                rows={3}
                placeholder="Research interest / motivation"
                value={form.researchInterest}
                onChange={set('researchInterest')}
                className={`${inputCls} resize-none`}
              />
            </div>

            {error && (
              <p className="mt-3 rounded-xl bg-error-container px-3 py-2 text-sm text-error">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
            >
              {loading ? 'Submitting…' : 'Submit application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
