'use client';

import React, { useState } from 'react';
import { PromptManager } from './prompts/PromptManager';
import { FinanceDashboard } from './finance/FinanceDashboard';
import { AnalyticsDashboard } from './analytics/AnalyticsDashboard';
import { UserInspector } from './users/UserInspector';

type Tab = 'users' | 'prompts' | 'finance' | 'analytics';

export default function AdminApp() {
  const [tab, setTab] = useState<Tab>('users');

  const tabs = [
    { id: 'users' as Tab, label: 'User Inspector' },
    { id: 'prompts' as Tab, label: 'Prompt Manager' },
    { id: 'finance' as Tab, label: 'Finance' },
    { id: 'analytics' as Tab, label: 'Analytics' },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen p-5">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-xl mb-6 flex justify-between items-center shadow-xl border border-gray-700">
        <h1 className="m-0 text-2xl font-bold">👮 DestinyAI Admin</h1>
        <div className="text-sm opacity-80 font-medium">Authorized Personnel Only</div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto bg-white rounded-t-lg px-4">
          {tabs.map((t) => (
            <div
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-6 py-4 cursor-pointer border-b-3 transition-all duration-200 ${
                tab === t.id
                  ? 'border-primary-600 font-bold text-primary-600 bg-primary-50/50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          {tab === 'users' && <UserInspector />}
          {tab === 'prompts' && <PromptManager />}
          {tab === 'finance' && <FinanceDashboard />}
          {tab === 'analytics' && <AnalyticsDashboard />}
        </div>
      </div>
    </div>
  );
}
