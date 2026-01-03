import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@destiny-ai/database';

export const logEvent = async (eventName: string, params: Record<string, unknown> = {}, userId?: string): Promise<void> => {
  if (!db) return;
  try {
    await addDoc(collection(db, 'analytics'), {
      eventName,
      userId: userId || 'anonymous',
      params,
      timestamp: serverTimestamp()
    });
  } catch (e) {
    const error = e as Error;
    console.warn("Analytics failed", error);
  }
};
