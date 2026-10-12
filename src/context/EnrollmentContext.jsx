import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { subscribeEnrollments } from '../lib/enrollments';
import { useAuth } from './AuthContext';

const EnrollmentContext = createContext(null);

const EMPTY = {
  enrollments: [],
  loading: false,
  getEnrollment: () => null,
  isCourseSubscribed: () => false,
};

function EnrollmentSubscriber({ uid, children }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeEnrollments(uid, (list) => {
      setEnrollments(list);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  const value = useMemo(
    () => ({
      enrollments,
      loading,
      getEnrollment: (courseId) => enrollments.find((e) => e.courseId === courseId) || null,
      isCourseSubscribed: (courseId) => enrollments.some((e) => e.courseId === courseId),
    }),
    [enrollments, loading]
  );

  return <EnrollmentContext.Provider value={value}>{children}</EnrollmentContext.Provider>;
}

export function EnrollmentProvider({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <EnrollmentContext.Provider value={EMPTY}>{children}</EnrollmentContext.Provider>;
  }

  return (
    <EnrollmentSubscriber key={user.uid} uid={user.uid}>
      {children}
    </EnrollmentSubscriber>
  );
}

export function useEnrollment() {
  const context = useContext(EnrollmentContext);
  return context || EMPTY;
}
