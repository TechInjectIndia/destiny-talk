'use client';

import Link from 'next/link';
import { Card, Navigation, Footer } from '@destiny-ai/ui';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
}

const navigationLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

const footerLinks = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/refund', label: 'Refund Policy' },
];

export default function PageLayout({ children, title }: PageLayoutProps) {
  const logo = (
    <Link href="/" className="no-underline text-inherit">
      <h1 className="nav-logo text-gradient m-0">🔮 DestinyAI</h1>
    </Link>
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-purple-50/30 min-h-screen">
      <Navigation logo={logo} links={navigationLinks} LinkComponent={Link} />
      <main className="max-w-7xl mx-auto p-5">
        <Card title={title}>{children}</Card>
        <Footer links={footerLinks} LinkComponent={Link} />
      </main>
    </div>
  );
}
