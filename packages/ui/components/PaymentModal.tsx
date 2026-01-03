'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './Button';

export interface PaymentModalProps {
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal = ({ amount, onClose, onSuccess }: PaymentModalProps) => {
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');

  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate 90% success rate
      if (Math.random() > 0.1) {
        setStatus('success');
        setTimeout(onSuccess, 1500); // Wait for user to see success
      } else {
        setStatus('failed');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [onSuccess]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000]">
      <div className="bg-white p-8 rounded-2xl w-[320px] text-center shadow-2xl border border-gray-200">
        {status === 'processing' && (
          <>
            <div className="text-4xl mb-2.5 animate-spin">🔄</div>
            <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
            <p className="text-gray-600">Securely charging ₹{amount}...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-4xl mb-2.5">✅</div>
            <h3 className="text-xl font-semibold mb-2 text-green-600">Payment Successful</h3>
            <p className="text-gray-600">Redirecting...</p>
          </>
        )}
        {status === 'failed' && (
          <>
            <div className="text-4xl mb-2.5">❌</div>
            <h3 className="text-xl font-semibold mb-2 text-red-600">Payment Failed</h3>
            <p className="text-gray-600 mb-4">Please try again.</p>
            <Button onClick={onClose} variant="secondary" className="w-auto">Close</Button>
          </>
        )}
      </div>
    </div>
  );
};

