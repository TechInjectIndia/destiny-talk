import { IUserRepository, UserProfile } from '@destiny-ai/core';
import { doc, getDoc, setDoc, updateDoc, collection, query, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../client';
import { FirestoreCollections } from '../collections';
import { toDate } from './converters';

export class FirebaseUserRepository implements IUserRepository {
  async getUser(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db, FirestoreCollections.USERS, uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      uid: snap.id,
      ...data,
      createdAt: toDate(data.createdAt)
    } as UserProfile;
  }

  async updateUser(uid: string, data: Partial<UserProfile>): Promise<void> {
    // Exclude createdAt from update if present or handle it
    const updateData: any = { ...data };
    if (updateData.createdAt) delete updateData.createdAt; // usually don't update createdAt
    await updateDoc(doc(db, FirestoreCollections.USERS, uid), updateData);
  }

  async saveUser(uid: string, data: Partial<UserProfile>): Promise<void> {
    const saveData: any = { ...data };
    if (!saveData.createdAt) saveData.createdAt = serverTimestamp();
    await setDoc(doc(db, FirestoreCollections.USERS, uid), saveData, { merge: true });
  }

  async createUser(uid: string, data: UserProfile): Promise<void> {
    await setDoc(doc(db, FirestoreCollections.USERS, uid), {
      ...data,
      createdAt: serverTimestamp()
    });
  }

  async listUsers(limitCount = 20): Promise<UserProfile[]> {
    const q = query(collection(db, FirestoreCollections.USERS), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        uid: d.id,
        ...data,
        createdAt: toDate(data.createdAt)
      } as UserProfile;
    });
  }
}
