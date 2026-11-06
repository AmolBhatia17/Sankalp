import React, { createContext, useContext } from 'react';

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  // Fail closed until subscriptions can be verified by a trusted backend.
  const subscriptions = [];
  const loadingSubscriptions = false;

  const isCourseSubscribed = () => false;

  // Client-side code must never create a verified subscription.
  const subscribeCourse = () => false;

  const resetCourseSubscription = () => {};

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
