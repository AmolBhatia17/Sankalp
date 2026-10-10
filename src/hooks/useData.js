import { useEffect, useState } from 'react';
import { subscribePublishedCourses, subscribeCourses, subscribeCourse } from '../lib/courses';
import { subscribeReviews } from '../lib/reviews';
import {
  subscribeBookmarks,
  subscribeNotifications,
  subscribeCredentials,
} from '../lib/userContent';

function useSubscription(subscribe, deps = []) {
  const [data, setData] = useState(null);
  useEffect(() => {
    const unsub = subscribe(setData);
    return () => unsub && unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return data;
}

export const usePublishedCourses = () => useSubscription(subscribePublishedCourses);
export const useAllCourses = () => useSubscription(subscribeCourses);
export const useCourse = (id) => useSubscription((cb) => subscribeCourse(id, cb), [id]);
export const useReviews = (courseId) =>
  useSubscription((cb) => subscribeReviews(courseId, cb), [courseId]);

export const useBookmarks = (uid) => useSubscription((cb) => subscribeBookmarks(uid, cb), [uid]);
export const useNotifications = (uid) =>
  useSubscription((cb) => subscribeNotifications(uid, cb), [uid]);
export const useCredentials = (uid) =>
  useSubscription((cb) => subscribeCredentials(uid, cb), [uid]);
