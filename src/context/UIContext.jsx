import { createContext, useCallback, useContext, useRef, useState } from 'react';
import AuthModal from '../components/AuthModal';
import PaymentModal from '../components/PaymentModal';
import ReviewModal from '../components/modals/ReviewModal';
import DiplomaModal from '../components/modals/DiplomaModal';
import FellowshipModal from '../components/modals/FellowshipModal';
import OfficeHoursModal from '../components/modals/OfficeHoursModal';
import VideoPreviewModal from '../components/modals/VideoPreviewModal';
import { Icon } from '../components/ui';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [authOpen, setAuthOpen] = useState(false);
  const authSuccessRef = useRef(null);

  const [review, setReview] = useState({ open: false, courseId: '', courseTitle: '' });
  const [payment, setPayment] = useState({ open: false, course: null, onSuccess: null });
  const [diploma, setDiploma] = useState(null);
  const [fellowshipOpen, setFellowshipOpen] = useState(false);
  const [officeHoursOpen, setOfficeHoursOpen] = useState(false);
  const [video, setVideo] = useState({ open: false, title: '', url: '' });
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef(null);

  const value = {
    openAuth: (onSuccess) => {
      authSuccessRef.current = onSuccess || null;
      setAuthOpen(true);
    },
    closeAuth: () => setAuthOpen(false),
    openReview: (opts = {}) =>
      setReview({ open: true, courseId: opts.courseId || '', courseTitle: opts.courseTitle || '' }),
    openPayment: (course, onSuccess) => setPayment({ open: true, course, onSuccess }),
    openDiploma: (credential) => setDiploma(credential),
    openFellowship: () => setFellowshipOpen(true),
    openOfficeHours: () => setOfficeHoursOpen(true),
    openVideo: (opts = {}) => setVideo({ open: true, title: opts.title || '', url: opts.url || '' }),
    toast: (message) => {
      setToastMsg(message);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToastMsg(''), 2600);
    },
  };

  const closeReview = useCallback(() => setReview((r) => ({ ...r, open: false })), []);

  return (
    <UIContext.Provider value={value}>
      {children}

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => authSuccessRef.current?.()}
      />

      <ReviewModal
        isOpen={review.open}
        courseId={review.courseId}
        courseTitle={review.courseTitle}
        onClose={closeReview}
      />

      <PaymentModal
        isOpen={payment.open}
        course={payment.course}
        onSuccess={payment.onSuccess}
        onClose={() => setPayment((p) => ({ ...p, open: false }))}
      />

      <DiplomaModal credential={diploma} onClose={() => setDiploma(null)} />

      <FellowshipModal isOpen={fellowshipOpen} onClose={() => setFellowshipOpen(false)} />

      <OfficeHoursModal isOpen={officeHoursOpen} onClose={() => setOfficeHoursOpen(false)} />

      <VideoPreviewModal
        isOpen={video.open}
        title={video.title}
        url={video.url}
        onClose={() => setVideo({ open: false, title: '', url: '' })}
      />

      {toastMsg && (
        <div className="fixed right-6 top-24 z-[120] flex items-center gap-2 rounded-xl bg-secondary-fill px-4 py-3 text-sm font-semibold text-white shadow-2xl animate-in slide-in-from-top-2">
          <Icon name="check_circle" fill className="text-base" />
          {toastMsg}
        </div>
      )}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  return (
    context || {
      openAuth: () => {},
      closeAuth: () => {},
      openReview: () => {},
      openPayment: () => {},
      openDiploma: () => {},
      openFellowship: () => {},
      openOfficeHours: () => {},
      openVideo: () => {},
      toast: () => {},
    }
  );
}
