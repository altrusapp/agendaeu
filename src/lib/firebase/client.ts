// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Helper function to initialize and get the Firebase app, implementing a singleton pattern.
const getFirebaseApp = (): FirebaseApp => {
  if (getApps().length === 0) {
    // Initialize the app only if it's not already initialized.
    return initializeApp(firebaseConfig);
  }
  // Return the existing app instance.
  return getApp();
};

// Export functions that return the initialized services
export const getFirebaseAuth = (): Auth => {
  return getAuth(getFirebaseApp());
};

export const getFirebaseDb = (): Firestore => {
  return getFirestore(getFirebaseApp());
};
