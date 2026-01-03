'use client';

import React, { useState, useEffect } from 'react';
import { isConfigured, FirebaseAnalyticsRepository } from '@destiny-ai/database';
import { AnalyticsEvent } from '@destiny-ai/core';
import { Card } from '@destiny-ai/ui';

const analyticsRepo = new FirebaseAnalyticsRepository();

export const AnalyticsDashboard = () => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [metrics, setMetrics] = useState({ opens: 0, reports: 0, chats: 0 });

  useEffect(() => {
    if (!isConfigured) return;
    const unsubscribe = analyticsRepo.subscribeToEvents(100, (data) => {
      setEvents(data);
      setMetrics({
        opens: data.filter((e) => e.eventName === 'app_open').length,
        reports: data.filter((e) => e.eventName === 'report_purchase').length,
        chats: data.filter((e) => e.eventName === 'chat_sent').length,
      });
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <Card title="App Opens">
          <div className="text-4xl">{metrics.opens}</div>
        </Card>
        <Card title="Report Sales">
          <div className="text-4xl text-green-600">{metrics.reports}</div>
        </Card>
        <Card title="Chat Messages">
          <div className="text-4xl text-blue-600">{metrics.chats}</div>
        </Card>
      </div>
      <h3 className="mb-5">Real-time Log</h3>
      <div className="bg-black text-green-400 p-5 rounded-lg max-h-[300px] overflow-y-auto font-mono text-sm">
        {events.map((e) => (
          <div key={e.id} className="mb-1">
            <span className="text-gray-500">[{e.timestamp?.toLocaleTimeString()}]</span> {e.eventName}{' '}
            <span className="text-white">{JSON.stringify(e.params)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

