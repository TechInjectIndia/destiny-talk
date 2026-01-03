'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { UserProfile, FullReport, ChatMessage } from '@destiny-ai/core';
import { FirebaseChatRepository, FirebaseWalletRepository, FirebaseAnalyticsRepository, isConfigured } from '@destiny-ai/database';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { Card, Button, Input } from '@destiny-ai/ui';
import { useSystemPrompt } from '../../hooks/useSystemPrompt';

const chatRepo = new FirebaseChatRepository();
const walletRepo = new FirebaseWalletRepository();
const analyticsRepo = new FirebaseAnalyticsRepository();

interface ChatInterfaceProps {
  user: User;
  profile: UserProfile;
  report: FullReport;
  walletBalance: number;
}

export const ChatInterface = ({ user, profile, report, walletBalance }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatId = `chat_${report.reportId}`;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const systemPromptTemplate = useSystemPrompt('chat_consultant');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isConfigured) return;
    const unsubscribe = chatRepo.subscribeToMessages(chatId, 50, (msgs) => {
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, [chatId]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input is not supported in this browser. Try Chrome.');
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new SpeechRecognition() as any;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: { results: Array<Array<{ transcript: string }>> }) => {
      const transcript = event.results[0][0].transcript;
      setInputText((prev) => prev + (prev ? ' ' : '') + transcript);
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find((v) => v.lang.includes('IN') || v.name.includes('Google'));
      if (preferredVoice) utterance.voice = preferredVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    if (walletBalance < 10) {
      toast.error('Insufficient wallet balance. Please add funds to start consultation.');
      return;
    }

    setSending(true);
    const userMessageContent = inputText;
    setInputText('');

    try {
      await chatRepo.addMessage({ chatId, sender: 'user', content: userMessageContent, timestamp: new Date() });
      await analyticsRepo.logEvent({ eventName: 'chat_sent', params: { length: userMessageContent.length }, userId: user.uid });

      const filledPrompt = systemPromptTemplate
        .replace('{{name}}', profile.displayName)
        .replace('{{moolank}}', String(report.numerologyData.moolank))
        .replace('{{bhagyank}}', String(report.numerologyData.bhagyank))
        .replace('{{loshuGrid}}', JSON.stringify(report.numerologyData.loshuGrid))
        .replace('{{missingNumbers}}', report.numerologyData.missingNumbers.join(', '))
        .replace('{{history}}', messages.map((m) => `${m.sender.toUpperCase()}: ${m.content}`).join('\n'))
        .replace('{{question}}', userMessageContent);

      const aiResponse = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: filledPrompt,
          model: 'gemini-1.5-flash',
        }),
      });

      if (!aiResponse.ok) {
        throw new Error('Failed to generate AI response');
      }

      const data = await aiResponse.json();
      const rawText = data.text || '...';

      const isAnswer = rawText.trim().startsWith('[ANSWER]');
      const cleanText = rawText.replace(/^\[(ANSWER|CLARIFY)\]\s*/, '');

      if (isAnswer) {
        await walletRepo.processPaymentDeduction(user.uid, 10, 'Consultation Answer');

        await chatRepo.addMessage({
          chatId,
          sender: 'ai',
          content: cleanText,
          timestamp: new Date(),
          isPaid: true,
        });
        await analyticsRepo.logEvent({ eventName: 'chat_paid_answer', params: {}, userId: user.uid });
      } else {
        await chatRepo.addMessage({
          chatId,
          sender: 'ai',
          content: cleanText,
          timestamp: new Date(),
          isPaid: false,
        });
        await analyticsRepo.logEvent({ eventName: 'chat_free_clarify', params: {}, userId: user.uid });
      }
    } catch (e: unknown) {
      const error = e as Error;
      console.error(error);
      if (error.message.includes('Insufficient Balance')) {
        toast.error('The spirits are ready to answer, but your wallet is empty. Please recharge.');
      } else {
        toast.error('Error: ' + error.message);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Card title="Consult with Destiny" className="h-[600px] flex flex-col bg-gradient-to-br from-white to-purple-50/20 border-2 border-purple-100">
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl mb-3 border border-gray-200">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col mb-2.5 ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-br from-primary-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-800 border border-gray-200 shadow-md'
              }`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
            {msg.sender === 'ai' && (
              <div className="flex gap-2 items-center">
                <span
                  className={`text-xs mt-0.5 ml-1 ${
                    msg.isPaid ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {msg.isPaid ? '- ₹10 Deducted' : 'Free Clarification'}
                </span>
                <button
                  onClick={() => speakText(msg.content)}
                  className="border-none bg-transparent cursor-pointer text-base hover:opacity-70"
                  title="Read Aloud"
                >
                  🔊
                </button>
              </div>
            )}
          </div>
        ))}
        {sending && (
          <div className="text-gray-600 italic text-xs ml-2.5">Destiny is thinking...</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-3 items-center bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1">
          <Input
            value={inputText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)}
            placeholder="Ask a specific question..."
            className="mb-0 border-0 focus:ring-0"
          />
        </div>
        <Button
          onClick={startListening}
          variant={isListening ? 'danger' : 'secondary'}
          className="w-14 h-14 flex items-center justify-center mb-0 rounded-full p-0"
          title="Voice Input"
        >
          {isListening ? '🛑' : '🎤'}
        </Button>
        <Button onClick={handleSendMessage} disabled={sending || !inputText.trim()} className="w-auto mb-0 px-6">
          {sending ? '...' : 'Send'}
        </Button>
      </div>
    </Card>
  );
};

