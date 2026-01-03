'use client';

import React, { useState, useEffect } from 'react';
import { isConfigured, FirebaseOrderRepository } from '@destiny-ai/database';
import { Order } from '@destiny-ai/core';
import { Card } from '@destiny-ai/ui';

const orderRepo = new FirebaseOrderRepository();

export const FinanceDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (!isConfigured) return;
    const unsubscribe = orderRepo.subscribeToOrders(50, (data) => {
      setOrders(data);
      const revenue = data.filter((o) => o.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
      setTotalRevenue(revenue);
    });
    return () => unsubscribe();
  }, []);

  const paidOrders = orders.filter((o) => o.status === 'paid');
  const avgOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <Card title="Total Revenue (Last 50)">
          <div className="text-4xl font-bold text-green-600">₹{totalRevenue}</div>
        </Card>
        <Card title="Avg Order Value">
          <div className="text-4xl font-bold">₹{avgOrderValue}</div>
        </Card>
      </div>
      <h3 className="mb-5">Recent Orders</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2.5">ID</th>
              <th className="p-2.5">Amount</th>
              <th className="p-2.5">Status</th>
              <th className="p-2.5">Description</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-gray-300">
                <td className="p-2.5 text-xs text-gray-600">{o.id}</td>
                <td className="p-2.5 font-bold">₹{o.amount}</td>
                <td className="p-2.5">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      o.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : o.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {o.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-2.5">{o.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

