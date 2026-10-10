import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const userCol = (uid, name) => collection(db, 'users', uid, name);

function subscribeUserCol(uid, name, callback, sortFn) {
  if (!uid) {
    callback([]);
    return () => {};
  }
  return onSnapshot(userCol(uid, name), (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(sortFn ? list.sort(sortFn) : list);
  });
}

const byCreatedDesc = (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);

/* ---------------- Bookmarks ---------------- */
export const subscribeBookmarks = (uid, cb) => subscribeUserCol(uid, 'bookmarks', cb, byCreatedDesc);

export async function addBookmark(uid, bookmark) {
  const ref = await addDoc(userCol(uid, 'bookmarks'), { ...bookmark, createdAt: serverTimestamp() });
  return ref.id;
}

export async function deleteBookmark(uid, id) {
  await deleteDoc(doc(db, 'users', uid, 'bookmarks', id));
}

/* ---------------- Notes (one doc per lecture) ---------------- */
export function subscribeNote(uid, lectureId, cb) {
  if (!uid || !lectureId) {
    cb(null);
    return () => {};
  }
  return onSnapshot(doc(db, 'users', uid, 'notes', lectureId), (snap) =>
    cb(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  );
}

export async function saveNote(uid, lectureId, text) {
  await setDoc(
    doc(db, 'users', uid, 'notes', lectureId),
    { lectureId, text, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

/* ---------------- Notifications ---------------- */
export const subscribeNotifications = (uid, cb) =>
  subscribeUserCol(uid, 'notifications', cb, byCreatedDesc);

export async function addNotification(uid, notification) {
  await addDoc(userCol(uid, 'notifications'), {
    isRead: false,
    createdAt: serverTimestamp(),
    ...notification,
  });
}

export async function markNotificationRead(uid, id) {
  await setDoc(doc(db, 'users', uid, 'notifications', id), { isRead: true }, { merge: true });
}

/* ---------------- Credentials ---------------- */
export const subscribeCredentials = (uid, cb) =>
  subscribeUserCol(uid, 'credentials', cb, byCreatedDesc);

export async function addCredential(uid, credential) {
  const ref = await addDoc(userCol(uid, 'credentials'), {
    ...credential,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
