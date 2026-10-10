// Seeds the Firestore `courses` collection with the Sankalp starter catalog.
//
// One-time setup:
//   1. Firebase Console -> Project settings -> Service accounts -> Generate new private key
//   2. Save the JSON as scripts/serviceAccountKey.json  (gitignored)
//   3. npm run seed
//
// You can also point GOOGLE_APPLICATION_CREDENTIALS at any service-account JSON.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import admin from 'firebase-admin';
import { SEED_COURSES } from './seedData.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS || join(__dirname, 'serviceAccountKey.json');

if (!existsSync(keyPath)) {
  console.error(
    `\n✗ No service account key found at:\n    ${keyPath}\n\n` +
      'Download one from Firebase Console -> Project settings -> Service accounts,\n' +
      'save it as scripts/serviceAccountKey.json, then re-run `npm run seed`.\n'
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(readFileSync(keyPath, 'utf8'))),
});

const db = admin.firestore();
const { FieldValue } = admin.firestore;

async function seed() {
  const batch = db.batch();

  for (const { id, ...course } of SEED_COURSES) {
    batch.set(
      db.collection('courses').doc(id),
      {
        ...course,
        status: 'published',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  await batch.commit();
  console.log(`✓ Seeded ${SEED_COURSES.length} courses into Firestore.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('✗ Seed failed:', err);
    process.exit(1);
  });
