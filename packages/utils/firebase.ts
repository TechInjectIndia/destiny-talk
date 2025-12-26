import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let isConfigured = false;

try {
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }
      auth = getAuth(app);
      db = getFirestore(app);
      isConfigured = true;
  }
} catch (e) {
  console.error("Firebase Initialization Error:", e);
}

export { app, auth, db, isConfigured };
