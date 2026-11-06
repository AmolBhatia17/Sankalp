import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';
import { getIdTokenResult } from 'firebase/auth';
import { mockCourses } from '../data/mockCourses';

const COURSES_COLLECTION = 'courses';

async function requireAdmin() {
  const currentUser = auth?.currentUser;

  if (!currentUser) {
    throw new Error('You must sign in with an administrator account.');
  }

  const tokenResult = await getIdTokenResult(currentUser, true);

  if (tokenResult.claims.admin !== true) {
    throw new Error('Administrator permission is required for this operation.');
  }
}


/**
 * Normalizes course ID to a URL-friendly slug
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Subscribes to all published courses in real-time.
 * Distinguishes empty database results from connection failures.
 */
export function subscribeCourses(callback, errCallback) {
  if (!db) {
    callback(mockCourses, {
      source: 'local_fallback',
      isDbConnected: false,
      isEmpty: false,
      error: null,
    });
    return () => {};
  }

  const coursesCol = collection(db, COURSES_COLLECTION);
  return onSnapshot(
    coursesCol,
    (snapshot) => {
      if (snapshot.empty) {
        // Explicitly distinguish an empty database from a connection failure
        callback([], {
          source: 'firestore',
          isDbConnected: true,
          isEmpty: true,
          error: null,
          fallbackCourses: mockCourses,
        });
      } else {
        const liveList = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        callback(liveList, {
          source: 'firestore',
          isDbConnected: true,
          isEmpty: false,
          error: null,
        });
      }
    },
    (error) => {
      console.warn('Firestore courses subscription warning, falling back to mock courses:', error);
      errCallback?.(error);
      callback(mockCourses, {
        source: 'local_fallback_on_error',
        isDbConnected: false,
        isEmpty: false,
        error,
      });
    }
  );
}

/**
 * Fetches all courses once.
 */
export async function getAllCoursesOnce() {
  if (!db) return mockCourses;
  const snapshot = await getDocs(collection(db, COURSES_COLLECTION));
  if (snapshot.empty) return mockCourses;
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}


/**
 * Fetches a single course by its ID or slug from Firestore.
 * Falls back to mockCourses if not found or offline.
 */
export async function getCourseById(id) {
  if (db) {
    try {
      const docRef = doc(db, COURSES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
    } catch (err) {
      console.warn('Error fetching course from Firestore, checking mock data:', err);
    }
  }

  // Fallback to local mock data
  return mockCourses.find((c) => c.id === id) || null;
}

/**
 * Adds or updates a course in Firestore.
 */
async function saveCourseAsAdmin(courseData) {
  if (!db) {
    throw new Error('Firebase Firestore is not initialized.');
  }

  const id = courseData.id || slugify(courseData.title);
  const courseRef = doc(db, COURSES_COLLECTION, id);

  const payload = {
    ...courseData,
    id,
    updatedAt: serverTimestamp(),
  };

  if (!courseData.createdAt) {
    payload.createdAt = serverTimestamp();
  }

  await setDoc(courseRef, payload, { merge: true });
  return id;
}

export async function saveCourse(courseData) {
  await requireAdmin();
  return saveCourseAsAdmin(courseData);
}

/**
 * Deletes a course from Firestore.
 */
export async function deleteCourse(id) {
  await requireAdmin();
  if (!db) {
    throw new Error('Firebase Firestore is not initialized.');
  }
  const courseRef = doc(db, COURSES_COLLECTION, id);
  await deleteDoc(courseRef);
}

/**
 * Helper to batch seed initial catalog into Firestore if needed.
 */
export async function seedInitialCourses(courses = mockCourses) {
  await requireAdmin();

  for (const course of courses) {
    await saveCourseAsAdmin(course);
  }
  return true;
}
