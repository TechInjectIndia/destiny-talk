'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { UserProfile, NumerologyReport, FullReport } from '@destiny-ai/core';
import { FirebaseWalletRepository, FirebaseReportRepository, FirebaseAnalyticsRepository } from '@destiny-ai/database';
import toast from 'react-hot-toast';
import { Card, Button } from '@destiny-ai/ui';
import { useSystemPrompt } from '../../hooks/useSystemPrompt';

const walletRepo = new FirebaseWalletRepository();
const reportRepo = new FirebaseReportRepository();
const analyticsRepo = new FirebaseAnalyticsRepository();

interface ReportGeneratorProps {
  profile: UserProfile;
  coreNumbers: NumerologyReport;
  existingReport: FullReport | null;
  walletBalance: number;
}

export const ReportGenerator = ({
  profile,
  coreNumbers,
  existingReport,
  walletBalance,
}: ReportGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<FullReport | null>(existingReport);
  const systemPromptTemplate = useSystemPrompt('report_gen');

  useEffect(() => {
    setGeneratedReport(existingReport);
  }, [existingReport]);

  const handleUnlockReport = async () => {
    if (walletBalance < 100) {
      toast.error('Insufficient Balance. Please add funds to your wallet.');
      return;
    }
    if (!process.env.NEXT_PUBLIC_API_KEY) {
      toast.error('API Key is missing. Please contact support.');
      return;
    }
    setLoading(true);
    try {
      const reportId = 'rep_' + profile.uid;

      await walletRepo.processPaymentDeduction(profile.uid, 100, 'Destiny Blueprint Purchase', reportId);

      const filledPrompt = systemPromptTemplate
        .replace('{{name}}', profile.displayName)
        .replace('{{dob}}', `${profile.dobDay}/${profile.dobMonth}/${profile.dobYear}`)
        .replace('{{moolank}}', String(coreNumbers.moolank))
        .replace('{{bhagyank}}', String(coreNumbers.bhagyank))
        .replace('{{kua}}', String(coreNumbers.kua))
        .replace('{{loshuGrid}}', JSON.stringify(coreNumbers.loshuGrid))
        .replace('{{missingNumbers}}', coreNumbers.missingNumbers.join(', '));

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Generate my Destiny Blueprint.',
          systemInstruction: filledPrompt,
          model: 'gemini-1.5-flash',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      const newReportData: FullReport = {
        reportId,
        userId: profile.uid,
        numerologyData: coreNumbers,
        fullReportMarkdown: data.text || 'Error',
        createdAt: new Date(),
        version: 'v1.0',
      };
      await reportRepo.saveReport(newReportData);
      setGeneratedReport(newReportData);
      await analyticsRepo.logEvent({ eventName: 'report_purchase', params: { reportId }, userId: profile.uid });
      toast.success('Destiny Blueprint generated successfully!');
    } catch (e: unknown) {
      const error = e as Error;
      console.error(error);
      toast.error('Failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (generatedReport) {
    return (
      <Card title="Your Destiny Blueprint" className="border-2 border-primary-500 shadow-lg bg-gradient-to-br from-white to-primary-50/20">
        <div className="max-h-[500px] overflow-y-auto leading-relaxed text-gray-800 prose prose-headings:font-display prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900">
          <ReactMarkdown>{generatedReport.fullReportMarkdown}</ReactMarkdown>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Unlock Destiny Blueprint" className="bg-gradient-to-br from-white via-purple-50/30 to-primary-50/30 border-2 border-purple-200">
      <div className="text-center p-6">
        <div className="text-6xl mb-4 animate-pulse">📜</div>
        <h3 className="m-0 mb-3 text-2xl">Comprehensive Life Report</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Get a detailed 5-section analysis of your life path, career, relationships, and remedies
          tailored to your date of birth.
        </p>
        <div className="text-3xl font-bold mb-6 text-gradient">Price: ₹100</div>
        <Button onClick={handleUnlockReport} disabled={loading} variant="success" className="mb-3">
          {loading ? 'Analyzing Stars...' : 'Unlock Now (₹100)'}
        </Button>
        {walletBalance < 100 && (
          <div className="text-red-600 text-sm font-medium">Insufficient balance.</div>
        )}
      </div>
    </Card>
  );
};

