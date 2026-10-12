import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { addReview } from '../../lib/reviews';
import { Icon } from '../ui';

export default function ReviewModal({ isOpen, onClose, courseId, courseTitle }) {
  const { user, displayName } = useAuth();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const reset = () => {
    setRating(5);
    setText('');
    setError('');
    setSubmitted(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Please sign in to submit a review.');
      return;
    }
    if (!text.trim()) {
      setError('Please write a short review.');
      return;
    }

    setLoading(true);
    try {
      const authorName = displayName || name.trim() || 'Anonymous Learner';
      if (courseId) {
        await addReview(courseId, {
          authorId: user.uid,
          authorName,
          rating,
          quote: text.trim(),
        });
      } else {
        await addDoc(collection(db, 'feedback'), {
          authorId: user.uid,
          authorName,
          rating,
          quote: text.trim(),
          createdAt: serverTimestamp(),
        });
      }
      setSubmitted(true);
      setTimeout(handleClose, 1600);
    } catch (err) {
      console.error('Review submit failed:', err);
      setError('Could not submit your review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-line-strong bg-card px-4 py-3 text-sm outline-none transition focus:border-primary-hover focus:ring-2 focus:ring-primary-hover/30';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse/60 p-4 backdrop-blur-sm animate-in"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Write a review"
        className="w-full max-w-lg rounded-3xl border border-line bg-card p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container/40 text-secondary">
              <Icon name="check_circle" fill className="text-3xl" />
            </div>
            <h3 className="font-display text-xl font-bold">Thank you!</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Your review has been recorded.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">
                {courseId ? 'Review this course' : 'Share your feedback'}
              </h3>
              <button type="button" onClick={handleClose} aria-label="Close">
                <Icon name="close" className="text-on-surface-variant" />
              </button>
            </div>
            <p className="mb-5 text-sm text-on-surface-variant">
              {courseId ? courseTitle : 'Tell us what you think about Sankalp.'}
            </p>

            {!user && (
              <div className="mb-4 rounded-xl bg-warn-container px-3 py-2 text-sm text-warn">
                You must be signed in to post a review.
              </div>
            )}

            <div className="mb-4 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(i)}
                  aria-label={`${i} star`}
                >
                  <Icon
                    name="star"
                    fill={i <= (hover || rating)}
                    className={`text-3xl ${
                      i <= (hover || rating) ? 'text-gold' : 'text-faint'
                    }`}
                  />
                </button>
              ))}
            </div>

            {!user && (
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${inputCls} mb-3`}
              />
            )}

            <textarea
              rows={4}
              placeholder="Write your review…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`${inputCls} resize-none`}
            />

            {error && (
              <p className="mt-3 rounded-xl bg-error-container px-3 py-2 text-sm text-error">{error}</p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl bg-surface-low px-5 py-2.5 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !user}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
              >
                {loading ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
