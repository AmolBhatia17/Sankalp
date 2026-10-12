import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../ui';

export default function OfficeHoursModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [rsvpd, setRsvpd] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRsvp = async (e) => {
    e.preventDefault();
    setError('');
    if (!user) {
      setError('Please sign in to reserve a seat.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'rsvps'), {
        session: 'Office Hours — Advanced Perception',
        scheduledFor: 'Tomorrow, 4:00–5:15 PM',
        question: question.trim(),
        createdAt: serverTimestamp(),
      });
      setRsvpd(true);
      setTimeout(onClose, 2200);
    } catch (err) {
      console.error('RSVP failed:', err);
      setError('Could not reserve your seat. Please try again.');
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
        aria-label="Office hours"
        className="w-full max-w-md rounded-3xl border border-line bg-card p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {rsvpd ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container/40 text-secondary">
              <Icon name="event_available" fill className="text-3xl" />
            </div>
            <h3 className="font-display text-xl font-bold">Seat reserved</h3>
            <p className="mt-1 text-sm text-on-surface-variant">A calendar invite has been recorded for you.</p>
          </div>
        ) : (
          <form onSubmit={handleRsvp}>
            <div className="mb-4 flex items-start justify-between">
              <h3 className="font-display text-xl font-bold">Office hours</h3>
              <button type="button" onClick={onClose} aria-label="Close">
                <Icon name="close" className="text-on-surface-variant" />
              </button>
            </div>

            <div className="rounded-2xl border border-line bg-surface-low p-4">
              <p className="font-semibold text-on-surface">Live Q&A with Dr. Meera Krishnan</p>
              <p className="mt-1 text-sm text-on-surface-variant">Advanced Perception · Tomorrow, 4:00–5:15 PM</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-secondary">
                <Icon name="groups" className="text-sm" /> 142 fellows registered
              </p>
            </div>

            <textarea
              rows={3}
              placeholder="Add an optional question for the session…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-4 w-full resize-none rounded-xl border border-line-strong bg-card px-4 py-3 text-sm outline-none focus:border-primary-hover focus:ring-2 focus:ring-primary-hover/30"
            />

            {error && (
              <p className="mt-3 rounded-xl bg-error-container px-3 py-2 text-sm text-error">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
            >
              {loading ? 'Reserving…' : 'Reserve my seat'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
