import React, { useState } from "react";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebaseConfig";
import {
  X,
  Mail,
  Lock,
  User,
  GraduationCap,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [tab, setTab] = useState("signin"); // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const clearForm = () => {
    setError("");
    setResetSuccess(false);
  };

  const switchTab = (t) => {
    setTab(t);
    clearForm();
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess?.();
      onClose();
    } catch (e) {
      if (e.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled. Please try again.");
      } else {
        setError("Google sign-in failed. Please verify your connection or try email sign-in.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (tab === "signup") {
        // Enforce basic client-side password security
        if (password.length < 6) {
          setError("Password must be at least 6 characters long.");
          setLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      onSuccess?.();
      onClose();
      console.warn("Auth error code:", e.code);
      const msg = {
        "auth/email-already-in-use": "This email is already registered. Please Sign In instead.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password must be at least 6 characters long.",
        "auth/user-not-found": "No account found with this email address. Please use the Sign Up option to create an account.",
        "auth/wrong-password": "Incorrect password. If you forgot your password, use the 'Forgot Password?' link.",
        "auth/invalid-credential": "No account found with this email, or incorrect credentials. If you are a new learner, please Sign Up.",
        "auth/invalid-login-credentials": "No account found with this email, or incorrect credentials. If you are a new learner, please Sign Up.",
        "auth/too-many-requests": "Access temporarily blocked due to repeated failed attempts. Please reset your password or try again later.",
        "auth/network-request-failed": "Network error. Please check your internet connection.",
      };
      const fallback = tab === "signin"
        ? "No account found with this email, or incorrect credentials. If you don't have an account yet, please use Sign Up."
        : "Failed to create account. Please check your details and try again.";
      setError(msg[e.code] || fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }
    setLoading(true);
    setError("");
    setResetSuccess(false);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSuccess(true);
    } catch (e) {
      const resetMsg = {
        "auth/user-not-found": "No account exists with this email. Please check your spelling or Sign Up.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/too-many-requests": "Too many requests. Please wait a few minutes before trying again.",
      };
      // Note: If email enumeration protection is on, Firebase may succeed silently or return generic error
      setError(resetMsg[e.code] || "Failed to send reset email. Please ensure the email is typed correctly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>

        {/* Close Button */}
        <button className="auth-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {/* Brand Logo */}
        <div className="auth-logo">
          <GraduationCap size={32} color="#34d399" />
          <span>Sankalp</span>
        </div>

        {tab === "forgot" ? (
          /* Forgot Password Header */
          <>
            <h2 className="auth-title">Reset Password</h2>
            <p className="auth-subtitle">
              Enter your registered email address and we'll send a secure password reset link to your inbox.
            </p>
          </>
        ) : (
          /* Sign In / Sign Up Header */
          <>
            <h2 className="auth-title">
              {tab === "signin" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="auth-subtitle">
              {tab === "signin"
                ? "Sign in to access your course materials"
                : "Join Sankalp to unlock all course content"}
            </p>

            {/* Tab Switch */}
            <div className="auth-tabs">
              <button
                className={`auth-tab-btn ${tab === "signin" ? "active" : ""}`}
                onClick={() => switchTab("signin")}
              >
                Sign In
              </button>
              <button
                className={`auth-tab-btn ${tab === "signup" ? "active" : ""}`}
                onClick={() => switchTab("signup")}
              >
                Sign Up
              </button>
            </div>
          </>
        )}

        {/* Forgot Password View */}
        {tab === "forgot" ? (
          resetSuccess ? (
            <div className="auth-reset-success-box">
              <div className="reset-success-icon">
                <CheckCircle2 size={36} color="#34d399" />
              </div>
              <h3 className="reset-success-title">Reset Email Sent!</h3>
              <p className="reset-success-text">
                A secure password reset link has been dispatched to:
                <br />
                <strong>{email}</strong>
              </p>
              <p className="reset-instruction-hint">
                Check your inbox (and Spam/Promotions folder). Follow the link in the email to set a new password, then return to sign in.
              </p>
              <button
                type="button"
                className="auth-submit-btn"
                onClick={() => switchTab("signin")}
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleForgotPassword}>
              <div className="auth-field">
                <Mail size={16} className="auth-field-icon" />
                <input
                  id="auth-reset-email"
                  type="email"
                  placeholder="Your Registered Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="auth-error-banner">
                  <AlertCircle size={16} className="error-icon" />
                  <div className="error-text-wrap">
                    <span>{error}</span>
                    <button
                      type="button"
                      className="error-link-btn"
                      onClick={() => switchTab("signup")}
                    >
                      Need an account? Sign Up instead →
                    </button>
                  </div>
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <span className="auth-spinner" />
                ) : (
                  <>
                    <KeyRound size={16} />
                    <span>Send Reset Email</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="auth-back-link"
                onClick={() => switchTab("signin")}
              >
                <ArrowLeft size={14} />
                <span>Back to Sign In</span>
              </button>
            </form>
          )
        ) : (
          /* Sign In & Sign Up Views */
          <>
            {/* Google OAuth Button */}
            <button className="auth-google-btn" onClick={handleGoogle} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.1 33.1 29.6 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l6-6C34.5 6.5 29.5 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5C35.3 45.5 45 37 45 25c0-1.7-.2-3.3-.5-5z"/>
                <path fill="#34A853" d="M6.3 15.2l7 5.1C15 17 19.2 14.5 24 14.5c3 0 5.8 1.1 7.9 3l6-6C34.5 8.5 29.5 6.5 24 6.5c-7.7 0-14.3 4.4-17.7 10.7z"/>
                <path fill="#FBBC05" d="M24 45.5c5.4 0 10.4-1.9 14.2-5l-6.6-5.4C29.6 36.9 26.9 38 24 38c-5.5 0-10.1-3.8-11.6-9l-7 5.4C8.7 41.5 15.7 45.5 24 45.5z"/>
                <path fill="#EA4335" d="M44.5 25c0-1.7-.2-3.3-.5-5H24v8.5h11.7c-.8 2.3-2.3 4.3-4.3 5.7l6.6 5.4C41.8 36.5 44.5 31.2 44.5 25z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="auth-divider"><span>or</span></div>

            {/* Email Form */}
            <form className="auth-form" onSubmit={handleEmail}>
              {tab === "signup" && (
                <div className="auth-field">
                  <User size={16} className="auth-field-icon" />
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="auth-field">
                <Mail size={16} className="auth-field-icon" />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <Lock size={16} className="auth-field-icon" />
                <input
                  id="auth-password"
                  type={showPass ? "text" : "password"}
                  placeholder={tab === "signup" ? "Password (min. 6 chars)" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-show-pass"
                  onClick={() => setShowPass((p) => !p)}
                  tabIndex={-1}
                  aria-label="Toggle password"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Forgot Password Link (Only in Sign In view) */}
              {tab === "signin" && (
                <div className="auth-forgot-row">
                  <button
                    type="button"
                    className="auth-forgot-btn"
                    onClick={() => switchTab("forgot")}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Error Banner with helpful signup guidance */}
              {error && (
                <div className="auth-error-banner">
                  <AlertCircle size={16} className="error-icon" />
                  <div className="error-text-wrap">
                    <span>{error}</span>
                    {tab === "signin" && (
                      <button
                        type="button"
                        className="error-link-btn"
                        onClick={() => switchTab("signup")}
                      >
                        Don't have an account? Sign Up now →
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <span className="auth-spinner" />
                ) : (
                  tab === "signin" ? "Sign In" : "Create Account"
                )}
              </button>
            </form>

            <p className="auth-footer-text">
              {tab === "signin" ? "Don't have an account? " : "Already have an account? "}
              <button
                className="auth-switch-link"
                onClick={() => switchTab(tab === "signin" ? "signup" : "signin")}
              >
                {tab === "signin" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </>
        )}

      </div>
    </div>
  );
}

