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
const RESOURCES_COLLECTION = 'courseResources';

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
 * Public catalog subscription.
 * This collection must never contain protected modules or resource URLs.
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

  return onSnapshot(
    collection(db, COURSES_COLLECTION),
    (snapshot) => {
      if (snapshot.empty) {
        callback([], {
          source: 'firestore',
          isDbConnected: true,
          isEmpty: true,
          error: null,
          fallbackCourses: mockCourses,
        });
        return;
      }

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
    },
    (error) => {
      console.warn('Firestore courses subscription failed:', error);
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

export async function getAllCoursesOnce() {
  if (!db) return mockCourses;

  const snapshot = await getDocs(collection(db, COURSES_COLLECTION));

  if (snapshot.empty) return mockCourses;

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

export async function getCourseById(id) {
  if (db) {
    try {
      const courseRef = doc(db, COURSES_COLLECTION, id);
      const courseSnap = await getDoc(courseRef);

      if (courseSnap.exists()) {
        return {
          id: courseSnap.id,
          ...courseSnap.data(),
        };
      }
    } catch (error) {
      console.warn('Could not fetch course from Firestore:', error);
    }
  }

  return mockCourses.find((course) => course.id === id) || null;
}

/**
 * Saves public metadata separately from protected course resources.
 */
async function saveCourseAsAdmin(courseData) {
  if (!db) {
    throw new Error('Firebase Firestore is not initialized.');
  }

  const id = courseData.id || slugify(courseData.title);

  const {
    modules,
    ...courseFields
  } = courseData;

  // Never write modules or their URLs to the public courses collection.
  const metadata = {
    ...courseFields,
    id,
    sections: (courseFields.sections || []).map(({ id: sectionId, title }) => ({
      id: sectionId,
      title,
    })),
    updatedAt: serverTimestamp(),
  };

  const courseRef = doc(db, COURSES_COLLECTION, id);
  const existingCourse = await getDoc(courseRef);

  if (!existingCourse.exists() && !metadata.createdAt) {
    metadata.createdAt = serverTimestamp();
  }

  await setDoc(courseRef, metadata, { merge: true });

  // Write resources only when the caller explicitly supplies modules.
  // This prevents metadata-only edits from accidentally deleting resources.
  if (Array.isArray(modules)) {
    const resourcesRef = doc(db, RESOURCES_COLLECTION, id);

    await setDoc(resourcesRef, {
      courseId: id,
      modules,
      updatedAt: serverTimestamp(),
    });
  }

  return id;
}

export async function saveCourse(courseData) {
  await requireAdmin();
  return saveCourseAsAdmin(courseData);
}

export async function deleteCourse(id) {
  await requireAdmin();

  if (!db) {
    throw new Error('Firebase Firestore is not initialized.');
  }

  await Promise.all([
    deleteDoc(doc(db, COURSES_COLLECTION, id)),
    deleteDoc(doc(db, RESOURCES_COLLECTION, id)),
  ]);
}

/**
 * Seeds public course metadata.
 * Resource migration is a separate protected operation.
 */
export async function seedInitialCourses(courses = mockCourses) {
  await requireAdmin();

  for (const course of courses) {
    await saveCourseAsAdmin(course);
  }

  return true;
}
