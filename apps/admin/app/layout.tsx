import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DestinyAI Admin - Management Console',
  description: 'Admin dashboard for DestinyAI platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}






