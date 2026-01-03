'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  serverTimestamp,
  runTransaction,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import ReactMarkdown from "react-markdown";

import { auth, db, isConfigured } from '@destiny-ai/database';
import { logEvent } from '../../../packages/utils/analytics';
import { generateNumerologyProfile, type NumerologyReport } from '@destiny-ai/core';
import { Button, Card, Input, PaymentModal } from '@destiny-ai/ui';

// --- TYPES ---
interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  tob: string;
  pob: string;
  gender: 'male' | 'female';
  createdAt: Timestamp;
}

interface WalletTransaction {
  id?: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  referenceId?: string;
  timestamp: Timestamp;
  status: 'success' | 'pending' | 'failed';
}

interface FullReport {
  reportId: string;
  userId: string;
  numerologyData: NumerologyReport;
  fullReportMarkdown: string;
  createdAt: Timestamp;
  version: string;
}

interface ChatMessage {
  id?: string;
  chatId: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Timestamp;
  isPaid?: boolean;
}

// --- DEFAULTS ---
const DEFAULT_REPORT_PROMPT = `You are 'Destiny', a world-class Senior Numerologist and Life Coach. Your knowledge base includes: Chaldean Numerology, Loshu Grid analysis, and Vedic remedies.

CORE RULES:
1. ACCURACY: Never miscalculate Core Numbers (Moolank/Bhagyank).
2. TONE: Empathetic, professional, yet mystical. Avoid "woo-woo" language; use grounded explanations.
3. STRUCTURE: Use Markdown. Use bolding for key terms.
4. BOUNDARIES: If a user asks about medical diagnosis, legal verdicts, or lottery numbers, politely refuse citing ethical guidelines.
5. CONTEXT: You have access to the user's specific Numerology Chart. Do not ask for their DOB if it is already in the context.`;

const DEFAULT_CHAT_PROMPT = `You are 'Destiny', a helpful Numerologist. Answer questions based on the user's numerology chart.`;

// --- COMPONENTS ---

const AuthScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    try {
      if (isSignUp) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
      onLogin(); 
    } catch (err: unknown) { 
      const error = err as Error;
      setError(error.message); 
    }
  };

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: unknown) { 
      const error = err as Error;
      setError(error.message); 
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto' }}>
      <Card title={isSignUp ? "Create Account" : "Welcome Back"}>
        <Input label="Email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
        <Input label="Password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} type="password" placeholder="••••••••" />
        {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '0.9rem' }}>{error}</div>}
        <Button onClick={handleAuth}>{isSignUp ? "Sign Up" : "Log In"}</Button>
        <div style={{ textAlign: 'center', margin: '10px 0', fontSize: '0.9rem', color: '#666' }}>OR</div>
        <Button onClick={handleGoogle} variant="secondary">Continue with Google</Button>
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.9rem' }}>
          {isSignUp ? "Already have an account? " : "New to DestinyAI? "}
          <span onClick={() => setIsSignUp(!isSignUp)} style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}>{isSignUp ? "Log In" : "Sign Up"}</span>
        </div>
      </Card>
    </div>
  );
};

const OnboardingScreen = ({ user, onComplete }: { user: User, onComplete: () => void }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({ displayName: user.displayName || '', email: user.email || '', gender: 'male', dobDay: '', dobMonth: '', dobYear: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.dobDay || !formData.dobMonth || !formData.dobYear || !formData.displayName) { alert("Please fill in all required fields."); return; }
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const walletRef = doc(db, 'wallet', user.uid);
      await runTransaction(db, async (t) => {
        t.set(userRef, { ...formData, uid: user.uid, createdAt: serverTimestamp() }, { merge: true });
        const walletDoc = await t.get(walletRef);
        if (!walletDoc.exists()) t.set(walletRef, { balance: 0, updatedAt: serverTimestamp() });
      });
      await logEvent('onboarding_complete', { uid: user.uid }, user.uid);
      onComplete();
    } catch (e) { console.error(e); alert("Error saving profile."); } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto' }}>
      <Card title="Setup Your Profile">
        <p style={{ color: '#666', marginBottom: '20px' }}>To generate accurate numerology reports, we need your birth details.</p>
        <Input label="Full Name" value={formData.displayName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, displayName: e.target.value})} placeholder="John Doe" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <Input label="Day" value={formData.dobDay} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, dobDay: e.target.value})} placeholder="DD" type="number" />
          <Input label="Month" value={formData.dobMonth} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, dobMonth: e.target.value})} placeholder="MM" type="number" />
          <Input label="Year" value={formData.dobYear} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, dobYear: e.target.value})} placeholder="YYYY" type="number" />
        </div>
        <Input label="Time of Birth (Optional)" value={formData.tob || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, tob: e.target.value})} placeholder="HH:MM AM/PM" />
        <Input label="Place of Birth" value={formData.pob || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, pob: e.target.value})} placeholder="City, Country" />
        <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>Gender</label><select value={formData.gender} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, gender: e.target.value as 'male' | 'female'})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}><option value="male">Male</option><option value="female">Female</option></select></div>
        <Button onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Complete Profile"}</Button>
      </Card>
    </div>
  );
};

const WalletView = ({ userId }: { userId: string }) => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [activePayment, setActivePayment] = useState<number | null>(null);

  useEffect(() => {
    if (!isConfigured) return;
    const q = query(collection(db, 'walletTransactions'), where('walletId', '==', userId), orderBy('timestamp', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => { setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WalletTransaction[]); });
    return () => unsubscribe();
  }, [userId]);

  const initiatePayment = async (amount: number): Promise<void> => {
    try {
        await logEvent('initiate_payment', { amount }, userId);
        await addDoc(collection(db, 'orders'), {
            userId: userId,
            amount: amount,
            currency: 'INR',
            status: 'created',
            provider: 'stripe_sim',
            description: 'Wallet Recharge',
            createdAt: serverTimestamp()
        });
        setActivePayment(amount);
    } catch (e: unknown) { 
      const error = e as Error;
      alert("Failed to start payment: " + error.message); 
    }
  };

  const handlePaymentSuccess = async () => {
     if (!activePayment) return;
     const amount = activePayment;
     setActivePayment(null);

     try {
        const walletRef = doc(db, 'wallet', userId);
        const txRef = doc(collection(db, 'walletTransactions'));
        
        const recentOrders = await getDocs(query(collection(db, 'orders'), where('userId', '==', userId), where('status', '==', 'created'), orderBy('createdAt', 'desc'), limit(1)));
        if (recentOrders.empty) throw new Error("Order lost");
        const orderDoc = recentOrders.docs[0];

        await runTransaction(db, async (t) => {
            const walletDoc = await t.get(walletRef);
            if (!walletDoc.exists()) throw new Error("Wallet does not exist!");
            
            t.update(orderDoc.ref, { status: 'paid', paidAt: serverTimestamp() });
            const walletData = walletDoc.data();
            const newBalance = (walletData?.balance || 0) + amount;
            t.set(txRef, { 
                walletId: userId, 
                type: 'credit', 
                amount: amount, 
                description: 'Wallet Recharge', 
                status: 'success', 
                timestamp: serverTimestamp(), 
                referenceId: orderDoc.id 
            });
            t.update(walletRef, { balance: newBalance, updatedAt: serverTimestamp() });
        });
        await logEvent('payment_success', { amount }, userId);
     } catch (e: unknown) { 
       const error = e as Error;
       alert("Fulfillment failed: " + error.message); 
     }
  };

  return (
    <Card title="Wallet">
      {activePayment && <PaymentModal amount={activePayment} onClose={() => setActivePayment(null)} onSuccess={handlePaymentSuccess} />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
           <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Add Funds (Secure Payment)</h4>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
             {[50, 100, 200, 500].map(amt => <Button key={amt} variant="secondary" onClick={() => initiatePayment(amt)}>+ ₹{amt}</Button>)}
           </div>
           <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '10px' }}>* Payments processed via Simulated Secure Gateway (Stripe)</p>
        </div>
        <div>
          <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Recent Transactions</h4>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {transactions.length === 0 && <div style={{ fontSize: '0.9rem', color: '#999' }}>No transactions yet.</div>}
            {transactions.map(tx => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee', fontSize: '0.9rem' }}>
                 <span>{tx.description}</span><span style={{ color: tx.type === 'credit' ? 'green' : 'red', fontWeight: 500 }}>{tx.type === 'credit' ? '+' : '-'} ₹{tx.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

const useSystemPrompt = (type: 'report_gen' | 'chat_consultant') => {
    const [promptContent, setPromptContent] = useState<string>('');
    
    useEffect(() => {
      setPromptContent(type === 'report_gen' ? DEFAULT_REPORT_PROMPT : DEFAULT_CHAT_PROMPT);
      if (!isConfigured) return;
  
      const q = query(
        collection(db, 'prompts'), 
        where('type', '==', type), 
        where('isActive', '==', true), 
        limit(1)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setPromptContent(data.content as string);
        }
      });
      return () => unsubscribe();
    }, [type]);
  
    return promptContent;
  };

const ChatInterface = ({ user, profile, report, walletBalance }: { user: User, profile: UserProfile, report: FullReport, walletBalance: number }) => {
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
    const q = query(collection(db, 'chatMessages'), where('chatId', '==', chatId), orderBy('timestamp', 'asc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatMessage[]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, [chatId]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Voice input is not supported in this browser. Try Chrome.");
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
        setInputText(prev => prev + (prev ? ' ' : '') + transcript);
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  const speakText = (text: string) => {
      if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel(); 
          const utterance = new SpeechSynthesisUtterance(text);
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(v => v.lang.includes('IN') || v.name.includes('Google'));
          if (preferredVoice) utterance.voice = preferredVoice;
          window.speechSynthesis.speak(utterance);
      }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    if (walletBalance < 10) { alert("Insufficient wallet balance. Please add funds to start consultation."); return; }
    
    setSending(true);
    const userMessageContent = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, 'chatMessages'), { chatId, sender: 'user', content: userMessageContent, timestamp: serverTimestamp() });
      await logEvent('chat_sent', { length: userMessageContent.length }, user.uid);

      let filledPrompt = systemPromptTemplate
        .replace('{{name}}', profile.displayName)
        .replace('{{moolank}}', String(report.numerologyData.moolank))
        .replace('{{bhagyank}}', String(report.numerologyData.bhagyank))
        .replace('{{loshuGrid}}', JSON.stringify(report.numerologyData.loshuGrid))
        .replace('{{missingNumbers}}', report.numerologyData.missingNumbers.join(', '))
        .replace('{{history}}', messages.map(m => `${m.sender.toUpperCase()}: ${m.content}`).join('\n'))
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
      const rawText = data.text || "...";
      
      const isAnswer = rawText.trim().startsWith('[ANSWER]');
      const cleanText = rawText.replace(/^\[(ANSWER|CLARIFY)\]\s*/, '');

      if (isAnswer) {
        const walletRef = doc(db, 'wallet', user.uid);
        const txRef = doc(collection(db, 'walletTransactions'));
        
        await runTransaction(db, async (t) => {
           const walletDoc = await t.get(walletRef);
           const walletData = walletDoc.data();
           if (!walletDoc.exists || !walletData || walletData.balance < 10) throw new Error("Insufficient Balance for Answer");
           
           t.update(walletRef, { balance: walletData.balance - 10, updatedAt: serverTimestamp() });
           
           t.set(txRef, { 
             walletId: user.uid, 
             type: 'debit', 
             amount: 10, 
             description: 'Consultation Answer', 
             status: 'success', 
             timestamp: serverTimestamp() 
           });
        });
        
        await addDoc(collection(db, 'chatMessages'), { 
            chatId, 
            sender: 'ai', 
            content: cleanText, 
            timestamp: serverTimestamp(),
            isPaid: true 
        });
        await logEvent('chat_paid_answer', {}, user.uid);

      } else {
         await addDoc(collection(db, 'chatMessages'), { 
            chatId, 
            sender: 'ai', 
            content: cleanText, 
            timestamp: serverTimestamp(),
            isPaid: false
        });
        await logEvent('chat_free_clarify', {}, user.uid);
      }

    } catch (e: unknown) { 
        const error = e as Error;
        console.error(error); 
        if (error.message.includes("Insufficient Balance")) {
            alert("The spirits are ready to answer, but your wallet is empty. Please recharge.");
        } else {
            alert("Error: " + error.message); 
        }
    } finally { 
        setSending(false); 
    }
  };

  return (
    <Card title="Consult with Destiny" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '10px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
            <div style={{ maxWidth: '80%', padding: '12px', borderRadius: '12px', backgroundColor: msg.sender === 'user' ? '#000' : '#fff', color: msg.sender === 'user' ? '#fff' : '#000', border: msg.sender === 'ai' ? '1px solid #e5e7eb' : 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
               <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
            {msg.sender === 'ai' && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: msg.isPaid ? 'red' : 'green', marginTop: '2px', marginLeft: '4px' }}>
                        {msg.isPaid ? '- ₹10 Deducted' : 'Free Clarification'}
                    </span>
                    <button 
                        onClick={() => speakText(msg.content)} 
                        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }} 
                        title="Read Aloud"
                    >
                        🔊
                    </button>
                </div>
            )}
          </div>
        ))}
        {sending && <div style={{ color: '#666', fontStyle: 'italic', fontSize: '0.8rem', marginLeft: '10px' }}>Destiny is thinking...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
            <Input value={inputText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputText(e.target.value)} placeholder="Ask a specific question..." style={{ marginBottom: 0 }} />
        </div>
        <Button 
            onClick={startListening} 
            variant={isListening ? 'danger' : 'secondary'} 
            style={{ width: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 0 }}
            title="Voice Input"
        >
            {isListening ? '🛑' : '🎤'}
        </Button>
        <Button onClick={handleSendMessage} disabled={sending || !inputText.trim()} style={{ width: 'auto', marginBottom: 0 }}>{sending ? "..." : "Send"}</Button>
      </div>
    </Card>
  );
};

const ReportGenerator = ({ profile, coreNumbers, existingReport, walletBalance }: { profile: UserProfile, coreNumbers: NumerologyReport, existingReport: FullReport | null, walletBalance: number }) => {
  const [loading, setLoading] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<FullReport | null>(existingReport);
  const systemPromptTemplate = useSystemPrompt('report_gen');

  useEffect(() => { setGeneratedReport(existingReport); }, [existingReport]);

  const handleUnlockReport = async () => {
    if (walletBalance < 100) { alert("Insufficient Balance."); return; }
    if (!process.env.API_KEY) { alert("API Key is missing."); return; }
    setLoading(true);
    try {
      const walletRef = doc(db, 'wallet', profile.uid);
      const txRef = doc(collection(db, 'walletTransactions'));
      const reportId = 'rep_' + profile.uid;

      await runTransaction(db, async (t) => {
        const walletDoc = await t.get(walletRef);
        const walletData = walletDoc.data();
        if (!walletDoc.exists || !walletData || walletData.balance < 100) throw new Error("Insufficient funds");
        t.update(walletRef, { balance: walletData.balance - 100, updatedAt: serverTimestamp() });
        t.set(txRef, { walletId: profile.uid, type: 'debit', amount: 100, description: 'Destiny Blueprint Purchase', status: 'success', referenceId: reportId, timestamp: serverTimestamp() });
      });

      let filledPrompt = systemPromptTemplate
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
          prompt: "Generate my Destiny Blueprint.",
          systemInstruction: filledPrompt,
          model: 'gemini-1.5-flash',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      const newReportData: FullReport = { reportId, userId: profile.uid, numerologyData: coreNumbers, fullReportMarkdown: data.text || "Error", createdAt: serverTimestamp() as Timestamp, version: 'v1.0' };
      await setDoc(doc(db, 'reports', reportId), newReportData);
      setGeneratedReport(newReportData);
      await logEvent('report_purchase', { reportId }, profile.uid);
    } catch (e: unknown) { 
      const error = e as Error;
      console.error(error); 
      alert("Failed: " + error.message); 
    } finally { setLoading(false); }
  };

  if (generatedReport) return <Card title="Your Destiny Blueprint" style={{ border: '2px solid #4f46e5' }}><div style={{ maxHeight: '500px', overflowY: 'auto', lineHeight: '1.6', color: '#333' }}><ReactMarkdown>{generatedReport.fullReportMarkdown}</ReactMarkdown></div></Card>;
  return (
    <Card title="Unlock Destiny Blueprint">
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📜</div>
        <h3 style={{ margin: '0 0 10px 0' }}>Comprehensive Life Report</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>Get a detailed 5-section analysis of your life path, career, relationships, and remedies tailored to your date of birth.</p>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>Price: ₹100</div>
        <Button onClick={handleUnlockReport} disabled={loading} variant="success">{loading ? "Analyzing Stars..." : "Unlock Now (₹100)"}</Button>
        {walletBalance < 100 && <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '10px' }}>Insufficient balance.</div>}
      </div>
    </Card>
  );
};

const ConfigurationError = () => (
    <div style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ color: '#ef4444' }}>⚠️ Configuration Missing</h1>
        <p>The application cannot start because Firebase configuration is missing.</p>
        <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px', textAlign: 'left', marginTop: '20px' }}>
            <strong>Missing Environment Variables:</strong>
            <pre style={{ overflowX: 'auto' }}>NEXT_PUBLIC_FIREBASE_API_KEY</pre>
            <pre>NEXT_PUBLIC_FIREBASE_PROJECT_ID</pre>
            <pre>API_KEY (Gemini)</pre>
        </div>
        <p style={{ marginTop: '20px', color: '#666' }}>Please add these to your environment variables to continue.</p>
    </div>
  );

export default function ClientApp() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [walletBalance, setWalletBalance] = useState(0);
    const [coreNumbers, setCoreNumbers] = useState<NumerologyReport | null>(null);
    const [fullReport, setFullReport] = useState<FullReport | null>(null);
  
    useEffect(() => {
      if (!isConfigured) {
          setLoading(false);
          return;
      }
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
          onSnapshot(doc(db, 'wallet', currentUser.uid), (snap) => setWalletBalance(snap.exists() ? snap.data()?.balance || 0 : 0));
          onSnapshot(doc(db, 'reports', 'rep_' + currentUser.uid), (snap) => { if (snap.exists()) setFullReport(snap.data() as FullReport); });
  
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile(data);
            if (data.dobDay) setCoreNumbers(generateNumerologyProfile(parseInt(data.dobDay), parseInt(data.dobMonth), parseInt(data.dobYear), data.gender));
            logEvent('app_open', {}, currentUser.uid);
          } else setProfile(null);
        } else {
          setProfile(null); setCoreNumbers(null); setFullReport(null); setWalletBalance(0);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }, []);
  
    if (!isConfigured) return <ConfigurationError />;
    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>Loading Destiny...</div>;
  
    const handleLogout = async () => await signOut(auth);
  
    if (!user) return <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', padding: '20px' }}><h1 style={{ textAlign: 'center', marginBottom: '40px' }}>🔮 DestinyAI</h1><AuthScreen onLogin={() => {}} /></div>;
    if (!profile) return <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', padding: '20px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '600px', margin: '0 auto' }}><h1>🔮 DestinyAI</h1><Button variant="secondary" onClick={handleLogout}>Logout</Button></div><OnboardingScreen user={user} onComplete={() => window.location.reload()} /></div>;
  
    return (
      <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '20px' }}>
        <header style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div><h1 style={{ margin: 0 }}>🔮 DestinyAI</h1><span style={{ fontSize: '0.9rem', color: '#666' }}>Welcome, {profile.displayName}</span></div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
             <div style={{ padding: '8px 16px', background: '#fff', borderRadius: '20px', fontWeight: 'bold', border: '1px solid #ddd', color: walletBalance > 0 ? 'green' : '#000' }}>₹{walletBalance}</div>
             <Button variant="secondary" onClick={handleLogout} style={{ marginBottom: 0 }}>Logout</Button>
          </div>
        </header>
        <nav style={{ maxWidth: '800px', margin: '0 auto 20px auto', display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '0.9rem' }}>
          <Link href="/about" style={{ color: '#666', textDecoration: 'none' }}>About</Link>
          <Link href="/pricing" style={{ color: '#666', textDecoration: 'none' }}>Pricing</Link>
          <Link href="/contact" style={{ color: '#666', textDecoration: 'none' }}>Contact</Link>
          <Link href="/privacy" style={{ color: '#666', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms" style={{ color: '#666', textDecoration: 'none' }}>Terms</Link>
        </nav>
        <main style={{ maxWidth: '800px', margin: '0 auto' }}>
          <WalletView userId={user.uid} />
          <Card title="Your Core Numerology">
            {coreNumbers ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#4f46e5' }}>{coreNumbers.moolank}</div><div style={{ fontWeight: 500 }}>Moolank</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#7c3aed' }}>{coreNumbers.bhagyank}</div><div style={{ fontWeight: 500 }}>Bhagyank</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#059669' }}>{coreNumbers.kua}</div><div style={{ fontWeight: 500 }}>Kua</div></div>
                  </div>
                  <div><strong>Missing Numbers:</strong> <span style={{ color: '#dc2626', marginLeft: '8px' }}>{coreNumbers.missingNumbers.join(', ')}</span></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><div style={{ marginBottom: '8px', fontWeight: 500 }}>Loshu Grid</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', maxWidth: '180px', margin: '0 auto' }}>{[[4,9,2],[3,5,7],[8,1,6]].flat().map(num => <div key={num} style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #333', backgroundColor: coreNumbers.loshuGrid[num] > 0 ? '#e0f7fa' : '#ffebee', fontWeight: 'bold', fontSize: '1.2rem' }}>{coreNumbers.loshuGrid[num] > 0 ? num : ''}</div>)}</div></div>
              </div>
            ) : <div>Error calculating profile.</div>}
          </Card>
          {coreNumbers && <ReportGenerator profile={profile} coreNumbers={coreNumbers} walletBalance={walletBalance} existingReport={fullReport} />}
          {fullReport && <ChatInterface user={user} profile={profile} report={fullReport} walletBalance={walletBalance} />}
        </main>
        <footer style={{ maxWidth: '800px', margin: '40px auto 0 auto', paddingTop: '20px', borderTop: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#666', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <Link href="/privacy" style={{ textDecoration: 'none', color: '#666' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ textDecoration: 'none', color: '#666' }}>Terms & Conditions</Link>
            <Link href="/refund" style={{ textDecoration: 'none', color: '#666' }}>Refund Policy</Link>
          </div>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} DestinyAI. All rights reserved.</p>
        </footer>
      </div>
    );
}

