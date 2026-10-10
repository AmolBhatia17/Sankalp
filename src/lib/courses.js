import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const coursesCol = () => collection(db, 'courses');
const courseRef = (id) => doc(db, 'courses', id);

const sortCourses = (list) =>
  [...list].sort((a, b) => {
    const aTime = a.createdAt?.seconds ?? 0;
    const bTime = b.createdAt?.seconds ?? 0;
    if (aTime !== bTime) return bTime - aTime;
    return (a.title || '').localeCompare(b.title || '');
  });

export function subscribeCourses(callback) {
  return onSnapshot(coursesCol(), (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(sortCourses(list));
  });
}

export function subscribePublishedCourses(callback) {
  const q = query(coursesCol(), where('status', '==', 'published'));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(sortCourses(list));
  });
}

export function subscribeCourse(id, callback) {
  return onSnapshot(courseRef(id), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

export async function getCourse(id) {
  const snap = await getDoc(courseRef(id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getCoursesOnce() {
  const snap = await getDocs(coursesCol());
  return sortCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
}

export async function createCourse(data) {
  const payload = {
    status: 'draft',
    rating: 0,
    reviewsCount: 0,
    enrolledCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...data,
  };
  const ref = await addDoc(coursesCol(), payload);
  return ref.id;
}

export async function updateCourse(id, data) {
  await updateDoc(courseRef(id), { ...data, updatedAt: serverTimestamp() });
}

export async function setCourseStatus(id, status) {
  await updateDoc(courseRef(id), { status, updatedAt: serverTimestamp() });
}

export async function deleteCourse(id) {
  await deleteDoc(courseRef(id));
}
