// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

let app: FirebaseApp;

// Helper function to initialize and get the Firebase app, implementing a singleton pattern.
const getFirebaseApp = (): FirebaseApp => {
  if (app) {
    return app;
  }

  // Define the config object inside the function to ensure env vars are read at runtime.
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Basic validation to ensure env vars are present on the client.
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error("Firebase config variables are not set. Please check your .env file and Vercel environment variables.");
  }

  if (getApps().length === 0) {
    // Initialize the app only if it's not already initialized.
    app = initializeApp(firebaseConfig);
  } else {
    // Return the existing app instance.
    app = getApp();
  }
  return app;
};

// Export functions that return the initialized services
export const getFirebaseAuth = (): Auth => {
  return getAuth(getFirebaseApp());
};

export const getFirebaseDb = (): Firestore => {
  return getFirestore(getFirebaseApp());
};
