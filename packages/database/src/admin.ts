import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// ensures it's only initialized once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Handle private key newlines for Vercel/environment variables
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { admin, adminDb, adminAuth };
