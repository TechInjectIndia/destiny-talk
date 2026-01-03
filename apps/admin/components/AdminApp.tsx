'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { isConfigured, FirebasePromptRepository, FirebaseOrderRepository, FirebaseAnalyticsRepository, FirebaseUserRepository } from '@destiny-ai/database';
import { SystemPrompt, Order, AnalyticsEvent, UserProfile } from '@destiny-ai/core';
import { Button, Card, Input, TextArea } from '@destiny-ai/ui';

// --- REPOSITORIES ---
const promptRepo = new FirebasePromptRepository();
const orderRepo = new FirebaseOrderRepository();
const analyticsRepo = new FirebaseAnalyticsRepository();
const userRepo = new FirebaseUserRepository();

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

const AdminPromptManager = () => {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [typeFilter, setTypeFilter] = useState<'report_gen' | 'chat_consultant'>('report_gen');
  const [editPrompt, setEditPrompt] = useState<Partial<SystemPrompt>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isConfigured) return;
    const unsubscribe = promptRepo.subscribeToPrompts((data) => {
      setPrompts(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!editPrompt.content || !editPrompt.version) return;
    try {
        if (editPrompt.isActive) {
            const others = prompts.filter(p => p.type === editPrompt.type && p.isActive);
            for (const p of others) {
                if (p.id) await promptRepo.updatePrompt(p.id, { isActive: false });
            }
        }
        await promptRepo.savePrompt({
            type: editPrompt.type || typeFilter,
            version: editPrompt.version,
            content: editPrompt.content,
            isActive: editPrompt.isActive || false,
            createdAt: new Date()
        });
        setIsEditing(false);
        setEditPrompt({});
        toast.success("Prompt saved successfully!");
    } catch (e) {
        const error = e as Error;
        console.error(error);
        toast.error("Failed to save prompt");
    }
  };

  const activePrompt = prompts.find(p => p.type === typeFilter && p.isActive);

  return (
    <div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <Button variant={typeFilter === 'report_gen' ? 'primary' : 'secondary'} onClick={() => setTypeFilter('report_gen')} style={{ width: 'auto' }}>Report Gen Prompts</Button>
            <Button variant={typeFilter === 'chat_consultant' ? 'primary' : 'secondary'} onClick={() => setTypeFilter('chat_consultant')} style={{ width: 'auto' }}>Chat Consultant Prompts</Button>
        </div>

        {isEditing ? (
            <Card title="Edit Prompt">
                <Input label="Version Label (e.g. v1.1)" value={editPrompt.version || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditPrompt({ ...editPrompt, version: e.target.value })} />
                <TextArea label="System Prompt Content" value={editPrompt.content || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditPrompt({ ...editPrompt, content: e.target.value })} rows={15} />
                <div style={{ marginBottom: '10px' }}><label><input type="checkbox" checked={editPrompt.isActive || false} onChange={(e) => setEditPrompt({ ...editPrompt, isActive: e.target.checked })} /> Set as Active</label></div>
                <div style={{ display: 'flex', gap: '10px' }}><Button onClick={handleSave}>Save Prompt</Button><Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button></div>
            </Card>
        ) : (
            <>
                <Card title="Active Prompt" style={{ borderLeft: '4px solid green' }}>
                     {activePrompt ? (
                        <div><strong>Version: {activePrompt.version}</strong><pre style={{ whiteSpace: 'pre-wrap', maxHeight: '100px', overflow: 'hidden', background: '#f5f5f5', padding: '10px' }}>{activePrompt.content}</pre></div>
                     ) : <p>No active prompt set. Using system defaults.</p>}
                     <Button onClick={() => { setEditPrompt({ type: typeFilter, content: activePrompt ? activePrompt.content : (typeFilter === 'report_gen' ? DEFAULT_REPORT_PROMPT : DEFAULT_CHAT_PROMPT), version: 'v' + (prompts.filter(p => p.type === typeFilter).length + 1) + '.0', isActive: true }); setIsEditing(true); }} style={{ marginTop: '10px' }}>Create New Version</Button>
                </Card>
                <h4>Version History</h4>
                {prompts.filter(p => p.type === typeFilter).map(p => (
                    <div key={p.id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', opacity: p.isActive ? 1 : 0.6 }}>
                        <span><strong>{p.version}</strong> {p.isActive && <span style={{ color: 'green', fontWeight: 'bold' }}>(Active)</span>}</span>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{p.id}</span>
                    </div>
                ))}
            </>
        )}
    </div>
  );
};

const AdminFinance = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [totalRevenue, setTotalRevenue] = useState(0);

    useEffect(() => {
        if (!isConfigured) return;
        const unsubscribe = orderRepo.subscribeToOrders(50, (data) => {
            setOrders(data);
            const revenue = data.filter(o => o.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
            setTotalRevenue(revenue);
        });
        return () => unsubscribe();
    }, []);

    const paidOrders = orders.filter(o => o.status === 'paid');
    const avgOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <Card title="Total Revenue (Last 50)">
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'green' }}>₹{totalRevenue}</div>
                </Card>
                <Card title="Avg Order Value">
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{avgOrderValue}</div>
                </Card>
            </div>
            <h3>Recent Orders</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
                <thead>
                    <tr style={{ background: '#eee', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>ID</th>
                        <th style={{ padding: '10px' }}>Amount</th>
                        <th style={{ padding: '10px' }}>Status</th>
                        <th style={{ padding: '10px' }}>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(o => (
                        <tr key={o.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '10px', fontSize: '0.8rem', color: '#666' }}>{o.id}</td>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>₹{o.amount}</td>
                            <td style={{ padding: '10px' }}>
                                <span style={{ 
                                    padding: '4px 8px', 
                                    borderRadius: '4px', 
                                    background: o.status === 'paid' ? '#dcfce7' : o.status === 'failed' ? '#fee2e2' : '#f3f4f6',
                                    color: o.status === 'paid' ? '#166534' : o.status === 'failed' ? '#991b1b' : '#374151',
                                    fontSize: '0.8rem', fontWeight: 600
                                }}>
                                    {o.status.toUpperCase()}
                                </span>
                            </td>
                            <td style={{ padding: '10px' }}>{o.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AdminAnalytics = () => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [metrics, setMetrics] = useState({ opens: 0, reports: 0, chats: 0 });

  useEffect(() => {
    if (!isConfigured) return;
    const unsubscribe = analyticsRepo.subscribeToEvents(100, (data) => {
      setEvents(data);
      setMetrics({
        opens: data.filter(e => e.eventName === 'app_open').length,
        reports: data.filter(e => e.eventName === 'report_purchase').length,
        chats: data.filter(e => e.eventName === 'chat_sent').length
      });
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
        <Card title="App Opens"><div style={{ fontSize: '2rem' }}>{metrics.opens}</div></Card>
        <Card title="Report Sales"><div style={{ fontSize: '2rem', color: 'green' }}>{metrics.reports}</div></Card>
        <Card title="Chat Messages"><div style={{ fontSize: '2rem', color: 'blue' }}>{metrics.chats}</div></Card>
      </div>
      <h3>Real-time Log</h3>
      <div style={{ background: '#000', color: '#0f0', padding: '20px', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto', fontFamily: 'monospace' }}>
        {events.map(e => (
          <div key={e.id} style={{ marginBottom: '4px' }}>
            <span style={{ color: '#666' }}>[{e.timestamp?.toLocaleTimeString()}]</span> {e.eventName} <span style={{ color: '#fff' }}>{JSON.stringify(e.params)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminUserInspector = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    useEffect(() => {
        if (!isConfigured) return;
        const fetchUsers = async () => {
            const data = await userRepo.listUsers(20);
            setUsers(data);
        };
        fetchUsers();
    }, []);

    return (
        <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead><tr style={{ background: '#eee', textAlign: 'left' }}><th style={{ padding: '8px' }}>Name</th><th style={{ padding: '8px' }}>Email</th><th style={{ padding: '8px' }}>DOB</th><th style={{ padding: '8px' }}>Action</th></tr></thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.uid} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '8px' }}>{u.displayName}</td>
                            <td style={{ padding: '8px' }}>{u.email}</td>
                            <td style={{ padding: '8px' }}>{u.dobDay}/{u.dobMonth}/{u.dobYear}</td>
                            <td style={{ padding: '8px' }}><Button variant="secondary" style={{ fontSize: '0.8rem', padding: '4px 8px', width: 'auto' }} onClick={() => toast.info(`Viewing detailed logs for ${u.uid} (Coming Phase 3)`)}>Inspect</Button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default function AdminApp() {
    const [tab, setTab] = useState<'users' | 'prompts' | 'finance' | 'analytics'>('users');
    
    return (
        <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '20px' }}>
            <div style={{ backgroundColor: '#1f2937', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0 }}>👮 DestinyAI Admin</h1>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Authorized Personnel Only</div>
            </div>
            
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd', overflowX: 'auto' }}>
                    <div onClick={() => setTab('users')} style={{ padding: '12px 20px', cursor: 'pointer', borderBottom: tab === 'users' ? '3px solid #4f46e5' : 'none', fontWeight: tab === 'users' ? 'bold' : 'normal', color: tab === 'users' ? '#4f46e5' : '#666' }}>User Inspector</div>
                    <div onClick={() => setTab('prompts')} style={{ padding: '12px 20px', cursor: 'pointer', borderBottom: tab === 'prompts' ? '3px solid #4f46e5' : 'none', fontWeight: tab === 'prompts' ? 'bold' : 'normal', color: tab === 'prompts' ? '#4f46e5' : '#666' }}>Prompt Manager</div>
                    <div onClick={() => setTab('finance')} style={{ padding: '12px 20px', cursor: 'pointer', borderBottom: tab === 'finance' ? '3px solid #4f46e5' : 'none', fontWeight: tab === 'finance' ? 'bold' : 'normal', color: tab === 'finance' ? '#4f46e5' : '#666' }}>Finance</div>
                    <div onClick={() => setTab('analytics')} style={{ padding: '12px 20px', cursor: 'pointer', borderBottom: tab === 'analytics' ? '3px solid #4f46e5' : 'none', fontWeight: tab === 'analytics' ? 'bold' : 'normal', color: tab === 'analytics' ? '#4f46e5' : '#666' }}>Analytics</div>
                </div>
                
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    {tab === 'users' && <AdminUserInspector />}
                    {tab === 'prompts' && <AdminPromptManager />}
                    {tab === 'finance' && <AdminFinance />}
                    {tab === 'analytics' && <AdminAnalytics />}
                </div>
            </div>
        </div>
    );
}
