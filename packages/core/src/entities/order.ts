export interface Order {
  id?: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed';
  provider: 'stripe_sim' | 'razorpay_sim';
  createdAt: Date;
  paidAt?: Date;
  description: string;
}
