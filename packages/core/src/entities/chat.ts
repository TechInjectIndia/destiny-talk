export interface ChatMessage {
  id?: string;
  chatId: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isPaid?: boolean;
}
