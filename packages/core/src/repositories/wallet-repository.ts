import { Wallet, WalletTransaction } from '../entities/wallet';

export interface IWalletRepository {
  getWallet(userId: string): Promise<Wallet | null>;
  createWallet(userId: string): Promise<void>;
  subscribeToWallet(userId: string, callback: (wallet: Wallet | null) => void): () => void;
  
  addTransaction(transaction: WalletTransaction): Promise<void>;
  getTransactions(userId: string, limitCount?: number): Promise<WalletTransaction[]>;
  subscribeToTransactions(userId: string, limitCount: number, callback: (transactions: WalletTransaction[]) => void): () => void;
  
  // Complex operations that might be in a service but putting in repo/service layer contract for now
  processPaymentSuccess(userId: string, amount: number, orderId: string, description: string): Promise<void>;
  processPaymentDeduction(userId: string, amount: number, description: string, referenceId?: string): Promise<void>;
}
