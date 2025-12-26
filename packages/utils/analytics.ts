import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const logEvent = async (eventName: string, params: any = {}, userId?: string) => {
  if (!db) return;
  try {
    addDoc(collection(db, 'analytics'), {
      eventName,
      userId: userId || 'anonymous',
      params,
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.warn("Analytics failed", e);
  }
};
