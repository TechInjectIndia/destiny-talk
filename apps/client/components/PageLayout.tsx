'use client';

import Link from 'next/link';
import { Card } from '@destiny-ai/ui';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function PageLayout({ children, title }: PageLayoutProps) {
  return (
    <div className="bg-red-200" style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      {/* Sticky Navigation */}
      <nav className="sticky-nav">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1 className="nav-logo">🔮 DestinyAI</h1>
            </Link>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.875rem' }}>
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/about" className="nav-link">About</Link>
              <Link href="/pricing" className="nav-link">Pricing</Link>
              <Link href="/contact" className="nav-link">Contact</Link>
              <Link href="/privacy" className="nav-link">Privacy</Link>
              <Link href="/terms" className="nav-link">Terms</Link>
            </div>
          </div>
        </div>
      </nav>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
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






