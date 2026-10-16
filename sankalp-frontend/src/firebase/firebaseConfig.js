import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app = null;
let authInstance = null;
let googleProviderInstance = null;
let dbInstance = null;

if (firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    // Explicitly ensure session persistence across browser reloads
    setPersistence(authInstance, browserLocalPersistence).catch((err) => {
      console.warn('Firebase persistence warning:', err);
    });
    googleProviderInstance = new GoogleAuthProvider();
  } catch (error) {
    console.warn('Firebase failed to initialize:', error);
  }
} else {
  console.warn(
    'Firebase API key is missing. Authentication and database features will use local mock data. Provide VITE_FIREBASE_API_KEY in .env to enable Firebase.'
  );
}

export { app };
export const auth = authInstance;
export const googleProvider = googleProviderInstance;
export const db = dbInstance;


