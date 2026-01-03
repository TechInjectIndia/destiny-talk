import { IOrderRepository, Order } from '@destiny-ai/core';
import { collection, addDoc, doc, getDoc, updateDoc, query, where, orderBy, limit, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../client';
import { FirestoreCollections } from '../collections';
import { toDate } from './converters';

export class FirebaseOrderRepository implements IOrderRepository {
  async createOrder(order: Omit<Order, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, FirestoreCollections.ORDERS), {
        ...order,
        createdAt: serverTimestamp()
    });
    return docRef.id;
  }

  async getOrder(orderId: string): Promise<Order | null> {
    const snap = await getDoc(doc(db, FirestoreCollections.ORDERS, orderId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return { id: snap.id, ...data, createdAt: toDate(data.createdAt), paidAt: data.paidAt ? toDate(data.paidAt) : undefined } as Order;
  }

  async updateOrder(orderId: string, data: Partial<Order>): Promise<void> {
    await updateDoc(doc(db, FirestoreCollections.ORDERS, orderId), data);
  }

  async getRecentOrders(userId: string, limitCount = 1): Promise<Order[]> {
    const q = query(collection(db, FirestoreCollections.ORDERS), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
        const data = d.data();
        return { id: d.id, ...data, createdAt: toDate(data.createdAt), paidAt: data.paidAt ? toDate(data.paidAt) : undefined } as Order;
    });
  }

  async getAllOrders(limitCount = 50): Promise<Order[]> {
    const q = query(collection(db, FirestoreCollections.ORDERS), orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
        const data = d.data();
        return { id: d.id, ...data, createdAt: toDate(data.createdAt), paidAt: data.paidAt ? toDate(data.paidAt) : undefined } as Order;
    });
  }

  subscribeToOrders(limitCount = 50, callback: (orders: Order[]) => void): () => void {
    const q = query(collection(db, FirestoreCollections.ORDERS), orderBy('createdAt', 'desc'), limit(limitCount));
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(d => {
            const data = d.data();
            return { id: d.id, ...data, createdAt: toDate(data.createdAt), paidAt: data.paidAt ? toDate(data.paidAt) : undefined } as Order;
        });
        callback(orders);
    });
  }
}
