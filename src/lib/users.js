import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const userRef = (uid) => doc(db, 'users', uid);

export async function ensureUserDoc(user) {
  const ref = userRef(user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const data = {
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      role: 'student',
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, data);
    return data;
  }
  return snap.data();
}

export function subscribeUser(uid, callback) {
  return onSnapshot(userRef(uid), (snap) => callback(snap.exists() ? snap.data() : null));
}

export async function updateUserProfile(uid, data) {
  await updateDoc(userRef(uid), data);
}

export async function updateUserRole(uid, role) {
  await updateDoc(userRef(uid), { role });
}
