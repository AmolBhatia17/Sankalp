import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from './useAuth';
import { SubscriptionContext } from './SubscriptionContextBase';

const EMPTY_SUBSCRIPTIONS = [];

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [subscriptionState, setSubscriptionState] = useState({
    uid: null,
    subscriptions: [],
    loading: true,
  });

  useEffect(() => {
    if (!user?.uid || !db) return undefined;

    const uid = user.uid;
    const enrollmentQuery = query(
      collection(db, 'enrollments'),
      where('uid', '==', uid),
      where('status', '==', 'active')
    );

    return onSnapshot(
      enrollmentQuery,
      (snapshot) => {
        setSubscriptionState({
          uid,
          subscriptions: snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          })),
          loading: false,
        });
      },
      (error) => {
        console.error('Could not load enrollments:', error);
        setSubscriptionState({
          uid,
          subscriptions: [],
          loading: false,
        });
      }
    );
  }, [user?.uid]);

  const currentState =
    user?.uid && db && subscriptionState.uid === user.uid
      ? subscriptionState
      : null;

  const subscriptions = currentState?.subscriptions ?? EMPTY_SUBSCRIPTIONS;
  const loadingSubscriptions = Boolean(
    user?.uid && db && (!currentState || currentState.loading)
  );

  const value = useMemo(() => ({
    subscriptions,
    loadingSubscriptions,
    isCourseSubscribed: (courseId) =>
      subscriptions.some(
        (item) => item.courseId === courseId && item.status === 'active'
      ),
    subscribeCourse: () => false,
    resetCourseSubscription: () => {},
  }), [subscriptions, loadingSubscriptions]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
