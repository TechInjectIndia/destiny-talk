'use client';

import React, { useState, useEffect } from 'react';
import { WalletTransaction } from '@destiny-ai/core';
import { FirebaseWalletRepository, FirebaseOrderRepository, FirebaseAnalyticsRepository, isConfigured } from '@destiny-ai/database';
import toast from 'react-hot-toast';
import { Card, Button, PaymentModal } from '@destiny-ai/ui';

const walletRepo = new FirebaseWalletRepository();
const orderRepo = new FirebaseOrderRepository();
const analyticsRepo = new FirebaseAnalyticsRepository();

interface WalletViewProps {
  userId: string;
}

export const WalletView = ({ userId }: WalletViewProps) => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [activePayment, setActivePayment] = useState<number | null>(null);

  useEffect(() => {
    if (!isConfigured) return;
    const unsubscribe = walletRepo.subscribeToTransactions(userId, 10, (txs) => {
      setTransactions(txs);
    });
    return () => unsubscribe();
  }, [userId]);

  const initiatePayment = async (amount: number): Promise<void> => {
    try {
      await analyticsRepo.logEvent({ eventName: 'initiate_payment', params: { amount }, userId });
      await orderRepo.createOrder({
        userId: userId,
        amount: amount,
        currency: 'INR',
        status: 'created',
        provider: 'stripe_sim',
        description: 'Wallet Recharge',
        createdAt: new Date(),
      });
      setActivePayment(amount);
      toast.success(`Payment initiated for ₹${amount}`);
    } catch (e: unknown) {
      const error = e as Error;
      toast.error('Failed to start payment: ' + error.message);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!activePayment) return;
    const amount = activePayment;
    setActivePayment(null);

    try {
      const recentOrders = await orderRepo.getRecentOrders(userId, 1);
      const pendingOrder = recentOrders.find((o) => o.status === 'created');

      if (!pendingOrder || !pendingOrder.id) throw new Error('Order lost');

      await walletRepo.processPaymentSuccess(userId, amount, pendingOrder.id, 'Wallet Recharge');
      await analyticsRepo.logEvent({ eventName: 'payment_success', params: { amount }, userId });
      toast.success(`Payment successful! ₹${amount} added to wallet.`);
    } catch (e: unknown) {
      const error = e as Error;
      toast.error('Fulfillment failed: ' + error.message);
    }
  };

  return (
    <Card title="Wallet" className="bg-gradient-to-br from-white to-primary-50/20">
      {activePayment && (
        <PaymentModal
          amount={activePayment}
          onClose={() => setActivePayment(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-gradient-to-br from-primary-50/50 to-purple-50/50 border border-primary-100">
          <h4 className="m-0 mb-4 text-gray-700 font-semibold">Add Funds (Secure Payment)</h4>
          <div className="grid grid-cols-2 gap-3">
            {[50, 100, 200, 500].map((amt) => (
              <Button 
                key={amt} 
                variant="secondary" 
                onClick={() => initiatePayment(amt)}
                className="bg-white hover:bg-gradient-to-r hover:from-primary-500 hover:to-purple-500 hover:text-white border border-gray-300 hover:border-transparent"
              >
                + ₹{amt}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            * Payments processed via Simulated Secure Gateway (Stripe)
          </p>
        </div>
        <div className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200">
          <h4 className="m-0 mb-4 text-gray-700 font-semibold">Recent Transactions</h4>
          <div className="max-h-[150px] overflow-y-auto space-y-2">
            {transactions.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4">No transactions yet.</div>
            )}
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex justify-between items-center py-2.5 px-3 rounded-lg bg-white border border-gray-100 hover:shadow-sm transition-shadow text-sm"
              >
                <span className="text-gray-700">{tx.description}</span>
                <span
                  className={`font-semibold px-2 py-1 rounded ${
                    tx.type === 'credit' 
                      ? 'text-green-700 bg-green-50' 
                      : 'text-red-700 bg-red-50'
                  }`}
                >
                  {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

