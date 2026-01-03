export interface Wallet {
  userId: string;
  balance: number;
  updatedAt: Date;
}

export interface WalletTransaction {
  id?: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  referenceId?: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'failed';
}
