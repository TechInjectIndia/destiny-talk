import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DestinyAI - Your Personal Numerologist',
  description: 'Get personalized numerology insights and guidance',
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






