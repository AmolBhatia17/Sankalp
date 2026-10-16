/**
 * Database Seed & Course Ingestion Script (Zero external dependencies)
 *
 * Usage:
 *   npm run seed:courses
 *   or: node scripts/seedCourses.js
 *
 * Reads courses from src/data/mockCourses.js and uploads them
 * into Cloud Firestore.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { mockCourses } from '../src/data/mockCourses.js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Simple .env parser to avoid extra dependencies
function loadEnv() {
  const envPath = resolve(__dirname, '../.env');
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

async function seed() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('❌ Missing Firebase credentials!');
    console.error('Please configure VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in sankalp-frontend/.env.');
    process.exit(1);
  }

  console.log(`🚀 Connecting to Firebase project "${firebaseConfig.projectId}"...`);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log(`📦 Seeding ${mockCourses.length} courses into Firestore collection 'courses'...`);

  for (const course of mockCourses) {
    const courseRef = doc(db, 'courses', course.id);
    const payload = {
      ...course,
      status: 'published',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    await setDoc(courseRef, payload, { merge: true });
    console.log(`  ✓ Seeded: "${course.title}" (${course.id}) with ${course.modules?.length || 0} modules.`);
  }

  console.log('🎉 Database seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
