import { useContext } from 'react';
import { SubscriptionContext } from './SubscriptionContextBase';

export function useSubscription() {
  return useContext(SubscriptionContext) || {
    subscriptions: [],
    loadingSubscriptions: false,
    isCourseSubscribed: () => false,
    subscribeCourse: () => false,
    resetCourseSubscription: () => {},
  };
}
