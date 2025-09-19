// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// This variable will hold the singleton instance of the Firebase app.
let app: FirebaseApp;

// This function implements the singleton pattern for Firebase app initialization.
const getFirebaseApp = (): FirebaseApp => {
  if (getApps().length === 0) {
    // If no app is initialized, create the config and initialize the app.
    // This ensures environment variables are read only when needed and on the client-side.
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
      throw new Error("Firebase config variables are not set. Please check your environment variables.");
    }
    
    app = initializeApp(firebaseConfig);
  } else {
    // If an app is already initialized, return the existing instance.
    app = getApp();
  }
  return app;
};

// Export functions that return the initialized services.
// Each function will ensure the app is initialized before getting the service.
export const getFirebaseAuth = (): Auth => {
  return getAuth(getFirebaseApp());
};

export const getFirebaseDb = (): Firestore => {
  return getFirestore(getFirebaseApp());
};
