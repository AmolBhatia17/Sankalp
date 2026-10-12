import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);

  // Sync subscriptions whenever authenticated user changes
  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setLoadingSubscriptions(false);
      return;
    }

    try {
      // Secure local store isolated per user UID
      const storageKey = `sankalp_sub_${user.uid}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSubscriptions(Array.isArray(parsed) ? parsed : []);
      } else {
        setSubscriptions([]);
      }
    } catch (e) {
      console.error('Failed to load user subscriptions:', e);
      setSubscriptions([]);
    } finally {
      setLoadingSubscriptions(false);
    }
  }, [user]);

  // Check if current user has an active subscription for this course
  const isCourseSubscribed = (courseId) => {
    if (!user) return false;
    return subscriptions.some(sub => sub.courseId === courseId || sub === courseId);
  };

  // Record a verified purchase
  const subscribeCourse = (courseId, paymentData = {}) => {
    if (!user) return false;

    const newRecord = {
      courseId,
      userId: user.uid,
      userEmail: user.email,
      purchasedAt: new Date().toISOString(),
      paymentId: paymentData.paymentId || `pay_sim_${Date.now()}`,
      orderId: paymentData.orderId || `order_${Date.now()}`,
      status: 'active',
      amount: paymentData.amount || 0,
    };

    const updated = [...subscriptions.filter(s => (s.courseId || s) !== courseId), newRecord];
    setSubscriptions(updated);

    try {
      const storageKey = `sankalp_sub_${user.uid}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist subscription:', e);
    }

    return true;
  };

  // Utility to revoke for testing
  const resetCourseSubscription = (courseId) => {
    if (!user) return;
    const updated = subscriptions.filter(s => (s.courseId || s) !== courseId);
    setSubscriptions(updated);
    try {
      const storageKey = `sankalp_sub_${user.uid}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to reset subscription:', e);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions,
        loadingSubscriptions,
        isCourseSubscribed,
        subscribeCourse,
        resetCourseSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  return context || {
    subscriptions: [],
    loadingSubscriptions: false,
    isCourseSubscribed: () => false,
    subscribeCourse: () => false,
    resetCourseSubscription: () => {},
  };
}
