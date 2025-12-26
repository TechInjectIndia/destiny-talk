import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import ClientApp from './apps/client/App';
import AdminApp from './apps/admin/App';

const AppGateway = () => {
    // In a real monorepo, these would be separate builds/domains.
    // For this environment, we toggle between them.
    const [currentApp, setCurrentApp] = useState<'client' | 'admin'>('client');

    return (
        <div>
            {/* Dev Switcher Toolbar */}
            <div style={{ 
                position: 'fixed', 
                bottom: '20px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                backgroundColor: '#333', 
                color: 'white', 
                padding: '8px 16px', 
                borderRadius: '30px', 
                zIndex: 9999,
                display: 'flex',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                fontSize: '0.9rem'
            }}>
                <span style={{ opacity: 0.7 }}>Environment:</span>
                <button 
                    onClick={() => setCurrentApp('client')}
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: currentApp === 'client' ? '#4f46e5' : 'white', 
                        fontWeight: currentApp === 'client' ? 'bold' : 'normal',
                        cursor: 'pointer'
                    }}
                >
                    Client App
                </button>
                <div style={{ width: '1px', background: '#555' }}></div>
                <button 
                    onClick={() => setCurrentApp('admin')}
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: currentApp === 'admin' ? '#4f46e5' : 'white', 
                        fontWeight: currentApp === 'admin' ? 'bold' : 'normal',
                        cursor: 'pointer'
                    }}
                >
                    Admin Console
                </button>
            </div>

            {/* App Mounting */}
            {currentApp === 'client' ? <ClientApp /> : <AdminApp />}
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<AppGateway />);
