import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const reviewsCol = (courseId) => collection(db, 'courses', courseId, 'reviews');

export function subscribeReviews(courseId, callback) {
  if (!courseId) {
    callback([]);
    return () => {};
  }
  return onSnapshot(reviewsCol(courseId), (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
    callback(list);
  });
}

export async function recomputeCourseRating(courseId) {
  const snap = await getDocs(reviewsCol(courseId));
  const reviews = snap.docs.map((d) => d.data());
  const count = reviews.length;
  const avg = count ? reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / count : 0;
  await updateDoc(doc(db, 'courses', courseId), {
    rating: Math.round(avg * 10) / 10,
    reviewsCount: count,
  });
}

export async function addReview(courseId, { authorId, authorName, rating, quote }) {
  await addDoc(reviewsCol(courseId), {
    authorId,
    authorName,
    rating,
    quote,
    createdAt: serverTimestamp(),
  });
  await recomputeCourseRating(courseId);
}
