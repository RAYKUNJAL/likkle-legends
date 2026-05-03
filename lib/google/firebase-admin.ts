import 'server-only';

import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

function normalizePrivateKey(key?: string): string | undefined {
  return key?.replace(/\\n/g, '\n');
}

function getAdminApp(): App {
  if (getApps().length) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (clientEmail && privateKey && projectId) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      storageBucket,
    });
  }

  return initializeApp({
    projectId,
    storageBucket,
  });
}

export function getFirebaseAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getFirebaseAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function getFirebaseAdminStorage(): Storage {
  return getStorage(getAdminApp());
}
