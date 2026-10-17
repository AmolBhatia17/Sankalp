import { useState, useEffect } from 'react';
import { subscribeCourses } from '../lib/courses';
import { mockCourses } from '../data/mockCourses';

export function useCourses() {
  const [courses, setCourses] = useState(mockCourses);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbStatus, setDbStatus] = useState({
    source: 'initializing',
    isDbConnected: false,
    isEmpty: false,
  });

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeCourses(
      (data, meta = {}) => {
        if (isMounted) {
          if (meta.isEmpty && meta.fallbackCourses) {
            setCourses(meta.fallbackCourses);
          } else {
            setCourses(data);
          }
          setLoading(false);
          setDbStatus({
            source: meta.source || 'unknown',
            isDbConnected: Boolean(meta.isDbConnected),
            isEmpty: Boolean(meta.isEmpty),
          });
          if (!meta.error) {
            setError(null);
          }
        }
      },
      (err) => {
        if (isMounted) {
          setError(err);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { courses, loading, error, dbStatus };
}
