// Firebase Auth — Google sign-in.
//
// This config is SHARED across every project under the `uskajitas` umbrella
// (genshape3d, mission_control, etc.). All values are public — they ship to
// the browser. The actual security boundary is the ALLOWED_EMAILS allowlist
// enforced server-side in `server/.env`.
//
// Do NOT replace these values. Every new project reuses the same Firebase
// project (`uskajitas-a4844`) so the user only ever has one Firebase project
// to manage. The only per-project Firebase task is adding the public domain
// to Authorized Domains in the console — see the skill's §14.

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey:            'AIzaSyBEjOpHINdKYzUljkJu7XUJysB0O0GrAo0',
  authDomain:        'uskajitas-a4844.firebaseapp.com',
  projectId:         'uskajitas-a4844',
  storageBucket:     'uskajitas-a4844.firebasestorage.app',
  messagingSenderId: '681192597057',
  appId:             '1:681192597057:web:33615caa5348c9e081c8c0',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOutUser = () => signOut(auth);
