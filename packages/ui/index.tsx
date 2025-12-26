import React, { useState, useEffect } from 'react';

export interface CardProps {
  children?: React.ReactNode;
  title: string;
  style?: React.CSSProperties;
}

export const Card = ({ children, title, style = {} }: CardProps) => (
  <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', margin: '16px 0', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', ...style }}>
    <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.25rem', fontWeight: 600, color: '#111' }}>{title}</h3>
    {children}
  </div>
);

export interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  style?: React.CSSProperties;
  title?: string;
}

export const Button = ({ onClick, children, variant = 'primary', disabled = false, style = {}, title }: ButtonProps) => {
  let bg = '#000';
  let color = '#fff';

  if (variant === 'secondary') { bg = '#e5e7eb'; color = '#000'; }
  else if (variant === 'danger') { bg = '#ef4444'; color = '#fff'; }
  else if (variant === 'success') { bg = '#10b981'; color = '#fff'; }
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{ 
        padding: '10px 20px', 
        backgroundColor: disabled ? '#ccc' : bg, 
        color: color, 
        border: 'none', 
        borderRadius: '6px', 
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 500,
        width: '100%',
        marginBottom: '8px',
        ...style
      }}
    >
      {children}
    </button>
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, style = {}, ...props }: InputProps) => (
  <div style={{ marginBottom: '12px' }}>
    {label && <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>{label}</label>}
    <input 
      style={{ 
        width: '100%', 
        padding: '10px', 
        borderRadius: '6px', 
        border: '1px solid #d1d5db',
        boxSizing: 'border-box',
        ...style
      }} 
      {...props}
    />
  </div>
);

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea = ({ label, rows = 5, style = {}, ...props }: TextAreaProps) => (
    <div style={{ marginBottom: '12px' }}>
      {label && <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>{label}</label>}
      <textarea 
        rows={rows}
        style={{ 
          width: '100%', 
          padding: '10px', 
          borderRadius: '6px', 
          border: '1px solid #d1d5db',
          boxSizing: 'border-box',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          ...style
        }} 
        {...props}
      />
    </div>
);

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
    }, []);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '300px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                {status === 'processing' && (
                    <>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }} className="spin">🔄</div>
                        <h3>Processing Payment</h3>
                        <p style={{ color: '#666' }}>Securely charging ₹{amount}...</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✅</div>
                        <h3 style={{ color: 'green' }}>Payment Successful</h3>
                        <p>Redirecting...</p>
                    </>
                )}
                {status === 'failed' && (
                    <>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>❌</div>
                        <h3 style={{ color: 'red' }}>Payment Failed</h3>
                        <p>Please try again.</p>
                        <Button onClick={onClose} variant="secondary">Close</Button>
                    </>
                )}
            </div>
        </div>
    );
};
