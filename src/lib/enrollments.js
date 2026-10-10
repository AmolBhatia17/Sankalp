import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const enrollmentsCol = () => collection(db, 'enrollments');

export const enrollmentId = (uid, courseId) => `${uid}_${courseId}`;

const enrollmentRef = (uid, courseId) => doc(db, 'enrollments', enrollmentId(uid, courseId));

export function subscribeEnrollments(uid, callback) {
  if (!uid) {
    callback([]);
    return () => {};
  }
  const q = query(enrollmentsCol(), where('uid', '==', uid));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeEnrollment(uid, courseId, callback) {
  if (!uid || !courseId) {
    callback(null);
    return () => {};
  }
  return onSnapshot(enrollmentRef(uid, courseId), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

export async function getEnrollment(uid, courseId) {
  const snap = await getDoc(enrollmentRef(uid, courseId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createEnrollment(uid, courseId, { userEmail, amount, paymentId, orderId } = {}) {
  const ref = enrollmentRef(uid, courseId);
  const existing = await getDoc(ref);
  if (existing.exists()) return;

  await setDoc(ref, {
    uid,
    courseId,
    status: 'active',
    userEmail: userEmail || '',
    amount: amount || 0,
    paymentId: paymentId || '',
    orderId: orderId || '',
    completedLectureIds: [],
    percentDone: 0,
    lastLectureId: '',
    purchasedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await updateDoc(doc(db, 'courses', courseId), { enrolledCount: increment(1) });
  } catch {
    /* course doc may not exist in edge cases */
  }
}

export async function updateEnrollmentProgress(uid, courseId, { completedLectureIds, percentDone, lastLectureId }) {
  const data = { updatedAt: serverTimestamp() };
  if (completedLectureIds) data.completedLectureIds = completedLectureIds;
  if (typeof percentDone === 'number') data.percentDone = percentDone;
  if (lastLectureId !== undefined) data.lastLectureId = lastLectureId;
  await updateDoc(enrollmentRef(uid, courseId), data);
}
