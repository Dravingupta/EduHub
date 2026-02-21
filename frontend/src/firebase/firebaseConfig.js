/**
 * Firebase Configuration
 *
 * Initializes the Firebase app using environment variables.
 * All secrets are loaded from .env (prefixed with VITE_ for Vite compatibility).
 * Never hardcode credentials — use VITE_FIREBASE_* env vars instead.
 */

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase project configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Auth instance — used across the app for authentication
export const auth = getAuth(app);

// Google Auth Provider — ready for Google Sign-In integration
export const googleProvider = new GoogleAuthProvider();

export default app;
