import { IWalletRepository, Wallet, WalletTransaction } from '@destiny-ai/core';
import { doc, getDoc, setDoc, updateDoc, collection, query, limit, getDocs, onSnapshot, runTransaction, orderBy, where, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../client';
import { toDate } from './converters';

export class FirebaseWalletRepository implements IWalletRepository {
  async getWallet(userId: string): Promise<Wallet | null> {
    const snap = await getDoc(doc(db, 'wallet', userId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      userId: snap.id,
      balance: data.balance || 0,
      updatedAt: toDate(data.updatedAt)
    };
  }

  async createWallet(userId: string): Promise<void> {
    await setDoc(doc(db, 'wallet', userId), {
      balance: 0,
      updatedAt: serverTimestamp()
    });
  }

  subscribeToWallet(userId: string, callback: (wallet: Wallet | null) => void): () => void {
    return onSnapshot(
      doc(db, 'wallet', userId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          callback({
            userId: snap.id,
            balance: data.balance || 0,
            updatedAt: toDate(data.updatedAt)
          });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.warn('Wallet snapshot error:', error);
        callback(null);
      }
    );
  }

  async addTransaction(transaction: WalletTransaction): Promise<void> {
    const ref = doc(collection(db, 'walletTransactions'));
    await setDoc(ref, {
      ...transaction,
      timestamp: serverTimestamp()
    });
  }

  async getTransactions(userId: string, limitCount = 10): Promise<WalletTransaction[]> {
    const q = query(
      collection(db, 'walletTransactions'), 
      where('walletId', '==', userId), 
      orderBy('timestamp', 'desc'), 
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      timestamp: toDate(d.data().timestamp)
    } as WalletTransaction));
  }

  subscribeToTransactions(userId: string, limitCount = 10, callback: (transactions: WalletTransaction[]) => void): () => void {
    const q = query(
      collection(db, 'walletTransactions'), 
      where('walletId', '==', userId), 
      orderBy('timestamp', 'desc'), 
      limit(limitCount)
    );
    return onSnapshot(q, (snap) => {
      const txs = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        timestamp: toDate(d.data().timestamp)
      } as WalletTransaction));
      callback(txs);
    });
  }

  async processPaymentSuccess(userId: string, amount: number, orderId: string, description: string): Promise<void> {
    const walletRef = doc(db, 'wallet', userId);
    const txRef = doc(collection(db, 'walletTransactions'));
    const orderRef = doc(db, 'orders', orderId);

    await runTransaction(db, async (t) => {
        const walletDoc = await t.get(walletRef);
        if (!walletDoc.exists()) throw new Error("Wallet does not exist!");
        
        t.update(orderRef, { status: 'paid', paidAt: serverTimestamp() });
        const walletData = walletDoc.data();
        const newBalance = (walletData?.balance || 0) + amount;
        
        t.set(txRef, { 
            walletId: userId, 
            type: 'credit', 
            amount: amount, 
            description: description, 
            status: 'success', 
            timestamp: serverTimestamp(), 
            referenceId: orderId 
        });
        t.update(walletRef, { balance: newBalance, updatedAt: serverTimestamp() });
    });
  }

  async processPaymentDeduction(userId: string, amount: number, description: string, referenceId?: string): Promise<void> {
    const walletRef = doc(db, 'wallet', userId);
    const txRef = doc(collection(db, 'walletTransactions'));

    await runTransaction(db, async (t) => {
       const walletDoc = await t.get(walletRef);
       const walletData = walletDoc.data();
       if (!walletDoc.exists() || !walletData || walletData.balance < amount) {
           throw new Error("Insufficient Balance");
       }
       
       t.update(walletRef, { balance: walletData.balance - amount, updatedAt: serverTimestamp() });
       
       t.set(txRef, { 
         walletId: userId, 
         type: 'debit', 
         amount: amount, 
         description: description, 
         status: 'success', 
         timestamp: serverTimestamp(),
         referenceId: referenceId
       });
    });
  }
}
