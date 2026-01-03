import { IChatRepository, ChatMessage } from '@destiny-ai/core';
import { collection, query, where, orderBy, limit, getDocs, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../client';
import { toDate } from './converters';

export class FirebaseChatRepository implements IChatRepository {
  async getMessages(chatId: string, limitCount = 50): Promise<ChatMessage[]> {
    const q = query(
      collection(db, 'chatMessages'), 
      where('chatId', '==', chatId), 
      orderBy('timestamp', 'asc'), 
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: toDate(doc.data().timestamp)
    } as ChatMessage));
  }

  async addMessage(message: ChatMessage): Promise<string> {
    const docRef = await addDoc(collection(db, 'chatMessages'), {
        ...message,
        timestamp: serverTimestamp()
    });
    return docRef.id;
  }

  subscribeToMessages(chatId: string, limitCount = 50, callback: (messages: ChatMessage[]) => void): () => void {
    const q = query(
      collection(db, 'chatMessages'), 
      where('chatId', '==', chatId), 
      orderBy('timestamp', 'asc'), 
      limit(limitCount)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            timestamp: toDate(doc.data().timestamp)
        } as ChatMessage));
        callback(msgs);
      },
      (error) => {
        console.warn('Chat messages snapshot error:', error);
        callback([]);
      }
    );
  }
}
