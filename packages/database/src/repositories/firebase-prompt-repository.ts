import { IPromptRepository, SystemPrompt } from '@destiny-ai/core';
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../client';
import { FirestoreCollections } from '../collections';
import { toDate } from './converters';

export class FirebasePromptRepository implements IPromptRepository {
  async getPrompts(type?: 'report_gen' | 'chat_consultant'): Promise<SystemPrompt[]> {
    let q;
    if (type) {
      q = query(collection(db, FirestoreCollections.PROMPTS), where('type', '==', type), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, FirestoreCollections.PROMPTS), orderBy('createdAt', 'desc'));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toDate(d.data().createdAt) } as SystemPrompt));
  }

  async getActivePrompt(type: 'report_gen' | 'chat_consultant'): Promise<SystemPrompt | null> {
    const q = query(
      collection(db, FirestoreCollections.PROMPTS), 
      where('type', '==', type), 
      where('isActive', '==', true), 
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data(), createdAt: toDate(d.data().createdAt) } as SystemPrompt;
  }

  async savePrompt(prompt: Omit<SystemPrompt, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, FirestoreCollections.PROMPTS), {
      ...prompt,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }

  async updatePrompt(id: string, data: Partial<SystemPrompt>): Promise<void> {
    await updateDoc(doc(db, FirestoreCollections.PROMPTS, id), data);
  }

  subscribeToPrompts(callback: (prompts: SystemPrompt[]) => void): () => void {
    const q = query(collection(db, FirestoreCollections.PROMPTS), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toDate(d.data().createdAt) } as SystemPrompt)));
    });
  }

  subscribeToActivePrompt(type: 'report_gen' | 'chat_consultant', callback: (prompt: SystemPrompt | null) => void): () => void {
    const q = query(
        collection(db, FirestoreCollections.PROMPTS), 
        where('type', '==', type), 
        where('isActive', '==', true), 
        limit(1)
    );
    return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const d = snapshot.docs[0];
            callback({ id: d.id, ...d.data(), createdAt: toDate(d.data().createdAt) } as SystemPrompt);
          } else {
            callback(null);
          }
        },
        (error) => {
            console.warn('Active prompt snapshot error:', error);
            // Don't callback null if error, maybe keep stale? Or callback null. 
            // Existing code ignores error and keeps default.
            // We'll callback null and let consumer handle fallback.
        }
    );
  }
}
