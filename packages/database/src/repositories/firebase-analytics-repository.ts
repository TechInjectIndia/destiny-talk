import { IAnalyticsRepository, AnalyticsEvent } from '@destiny-ai/core';
import { collection, addDoc, query, orderBy, limit, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../client';
import { toDate } from './converters';

export class FirebaseAnalyticsRepository implements IAnalyticsRepository {
  async logEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    await addDoc(collection(db, 'analytics'), {
        ...event,
        timestamp: serverTimestamp()
    });
  }

  async getEvents(limitCount = 100): Promise<AnalyticsEvent[]> {
    const q = query(collection(db, 'analytics'), orderBy('timestamp', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data(), timestamp: toDate(d.data().timestamp) } as AnalyticsEvent));
  }

  subscribeToEvents(limitCount = 100, callback: (events: AnalyticsEvent[]) => void): () => void {
    const q = query(collection(db, 'analytics'), orderBy('timestamp', 'desc'), limit(limitCount));
    return onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(d => ({ id: d.id, ...d.data(), timestamp: toDate(d.data().timestamp) } as AnalyticsEvent));
        callback(events);
    });
  }
}
