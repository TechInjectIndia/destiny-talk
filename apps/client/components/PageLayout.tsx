'use client';

import Link from 'next/link';
import { Card } from '@destiny-ai/ui';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function PageLayout({ children, title }: PageLayoutProps) {
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '20px' }}>
      <header style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1 style={{ margin: 0 }}>🔮 DestinyAI</h1>
          </Link>
          <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none', color: '#666', fontSize: '0.9rem' }}>Home</Link>
            <Link href="/about" style={{ textDecoration: 'none', color: '#666', fontSize: '0.9rem' }}>About</Link>
            <Link href="/pricing" style={{ textDecoration: 'none', color: '#666', fontSize: '0.9rem' }}>Pricing</Link>
            <Link href="/contact" style={{ textDecoration: 'none', color: '#666', fontSize: '0.9rem' }}>Contact</Link>
          </nav>
        </div>
      </header>
      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card title={title}>
          {children}
        </Card>
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#666', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <Link href="/privacy" style={{ textDecoration: 'none', color: '#666' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ textDecoration: 'none', color: '#666' }}>Terms & Conditions</Link>
            <Link href="/refund" style={{ textDecoration: 'none', color: '#666' }}>Refund Policy</Link>
          </div>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} DestinyAI. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}





