// Firebase Auth — Google sign-in.
//
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  REPLACE the config below with the values from your Firebase web app:    ║
// ║  Firebase console → Project settings → Your apps → <this app> → Config   ║
// ║  All values are PUBLIC (they ship to the browser). Allowlist is enforced ║
// ║  server-side via ADMIN_EMAILS in server/.env.                            ║
// ╚══════════════════════════════════════════════════════════════════════════╝

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey:            '__FIREBASE_API_KEY__',
  authDomain:        '__FIREBASE_AUTH_DOMAIN__',
  projectId:         '__FIREBASE_PROJECT_ID__',
  storageBucket:     '__FIREBASE_STORAGE_BUCKET__',
  messagingSenderId: '__FIREBASE_MESSAGING_SENDER_ID__',
  appId:             '__FIREBASE_APP_ID__',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOutUser = () => signOut(auth);
