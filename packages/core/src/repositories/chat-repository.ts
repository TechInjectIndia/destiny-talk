import { ChatMessage } from '../entities/chat';

export interface IChatRepository {
  getMessages(chatId: string, limitCount?: number): Promise<ChatMessage[]>;
  addMessage(message: ChatMessage): Promise<string>;
  subscribeToMessages(chatId: string, limitCount: number, callback: (messages: ChatMessage[]) => void): () => void;
}
