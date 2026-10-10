import { useState } from 'react';
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebaseConfig';

const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password must be at least 6 characters long.',
  'auth/user-not-found': 'No account found with this email. Please sign up.',
  'auth/wrong-password': 'Incorrect password. Try the "Forgot password?" link.',
  'auth/invalid-credential': 'Incorrect email or password. New here? Sign up.',
  'auth/invalid-login-credentials': 'Incorrect email or password. New here? Sign up.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Check your internet connection.',
  'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
};

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [tab, setTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const switchTab = (next) => {
    setTab(next);
    setError('');
    setResetSuccess(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess?.();
      onClose();
    } catch (e) {
      setError(ERROR_MESSAGES[e.code] || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (tab === 'signup') {
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      onSuccess?.();
      onClose();
    } catch (e) {
      const fallback =
        tab === 'signin'
          ? 'Incorrect email or password. Please try again or sign up.'
          : 'Failed to create account. Please check your details.';
      setError(ERROR_MESSAGES[e.code] || fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }
    setLoading(true);
    setError('');
    setResetSuccess(false);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSuccess(true);
    } catch (e) {
      const resetMsg = {
        'auth/user-not-found': 'No account exists with this email.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many requests. Please wait a few minutes.',
      };
      setError(resetMsg[e.code] || 'Failed to send reset email. Please check the address.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-line-strong bg-card px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary-hover focus:ring-2 focus:ring-primary-hover/30 placeholder:text-muted';
  const primaryBtn =
    'flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse/60 p-4 backdrop-blur-sm animate-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sign in to Sankalp"
        className="custom-scrollbar max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-line bg-card p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <span className="material-symbols-outlined">school</span>
            </div>
            <span className="font-display text-xl font-bold text-primary-accent">Sankalp</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-surface-low"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {tab === 'forgot' ? (
          <>
            <h2 className="font-display text-2xl font-bold">Reset password</h2>
            <p className="mb-6 mt-1 text-sm text-on-surface-variant">
              We'll email you a secure link to set a new password.
            </p>
          </>
        ) : (
          <>
            <h2 className="font-display text-2xl font-bold">
              {tab === 'signin' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="mb-5 mt-1 text-sm text-on-surface-variant">
              {tab === 'signin'
                ? 'Sign in to access your courses and labs.'
                : 'Join Sankalp to unlock every lecture and lab.'}
            </p>

            <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-surface-low p-1">
              {['signin', 'signup'].map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`rounded-lg py-2 text-sm font-semibold transition ${
                    tab === t ? 'bg-card text-primary-accent shadow-sm' : 'text-on-surface-variant'
                  }`}
                >
                  {t === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>
          </>
        )}

        {tab === 'forgot' && resetSuccess ? (
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container/40 text-secondary">
              <span className="material-symbols-outlined text-3xl">mark_email_read</span>
            </div>
            <h3 className="font-display text-lg font-bold">Reset email sent</h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              A reset link was sent to <strong>{email}</strong>. Check your inbox and follow the link.
            </p>
            <button className={`mt-5 ${primaryBtn}`} onClick={() => switchTab('signin')}>
              Back to Sign In
            </button>
          </div>
        ) : tab === 'forgot' ? (
          <form className="space-y-3" onSubmit={handleForgotPassword}>
            <input
              type="email"
              placeholder="Registered email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
              className={inputCls}
            />
            {error && (
              <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">{error}</p>
            )}
            <button type="submit" className={primaryBtn} disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Email'}
            </button>
            <button
              type="button"
              onClick={() => switchTab('signin')}
              className="w-full text-center text-sm font-medium text-on-surface-variant hover:text-primary-accent"
            >
              ← Back to Sign In
            </button>
          </form>
        ) : (
          <>
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-line-strong bg-card px-4 py-3 text-sm font-semibold transition hover:bg-surface-low disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.1 33.1 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l6-6C34.5 6.5 29.5 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5C35.3 45.5 45 37 45 25c0-1.7-.2-3.3-.5-5z" />
                <path fill="#34A853" d="M6.3 15.2l7 5.1C15 17 19.2 14.5 24 14.5c3 0 5.8 1.1 7.9 3l6-6C34.5 8.5 29.5 6.5 24 6.5c-7.7 0-14.3 4.4-17.7 10.7z" />
                <path fill="#FBBC05" d="M24 45.5c5.4 0 10.4-1.9 14.2-5l-6.6-5.4C29.6 36.9 26.9 38 24 38c-5.5 0-10.1-3.8-11.6-9l-7 5.4C8.7 41.5 15.7 45.5 24 45.5z" />
                <path fill="#EA4335" d="M44.5 25c0-1.7-.2-3.3-.5-5H24v8.5h11.7c-.8 2.3-2.3 4.3-4.3 5.7l6.6 5.4C41.8 36.5 44.5 31.2 44.5 25z" />
              </svg>
              Continue with Google
            </button>

            <div className="my-4 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-surface-highest" />
              or
              <span className="h-px flex-1 bg-surface-highest" />
            </div>

            <form className="space-y-3" onSubmit={handleEmail}>
              {tab === 'signup' && (
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className={inputCls}
                />
              )}
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputCls}
              />
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={tab === 'signup' ? 'Password (min. 6 chars)' : 'Password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  tabIndex={-1}
                  aria-label="Toggle password"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {tab === 'signin' && (
                <button
                  type="button"
                  onClick={() => switchTab('forgot')}
                  className="text-sm font-medium text-primary-accent hover:underline"
                >
                  Forgot password?
                </button>
              )}

              {error && (
                <div className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
                  {error}
                  {tab === 'signin' && (
                    <button
                      type="button"
                      onClick={() => switchTab('signup')}
                      className="ml-1 font-semibold underline"
                    >
                      Sign up instead
                    </button>
                  )}
                </div>
              )}

              <button type="submit" className={primaryBtn} disabled={loading}>
                {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-on-surface-variant">
              {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => switchTab(tab === 'signin' ? 'signup' : 'signin')}
                className="font-semibold text-primary-accent hover:underline"
              >
                {tab === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
