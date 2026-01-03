'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth, isConfigured, FirebaseUserRepository, FirebaseWalletRepository, FirebaseReportRepository, FirebaseAnalyticsRepository } from '@destiny-ai/database';
import { generateNumerologyProfile, NumerologyReport, UserProfile, FullReport } from '@destiny-ai/core';
import { Button, Card, Navigation, Footer } from '@destiny-ai/ui';
import { AuthScreen } from './auth/AuthScreen';
import { OnboardingScreen } from './auth/OnboardingScreen';
import { WalletView } from './wallet/WalletView';
import { ChatInterface } from './chat/ChatInterface';
import { ReportGenerator } from './report/ReportGenerator';
import { ConfigurationError } from './layout/ConfigurationError';

// --- REPOSITORIES ---
const userRepo = new FirebaseUserRepository();
const walletRepo = new FirebaseWalletRepository();
const reportRepo = new FirebaseReportRepository();
const analyticsRepo = new FirebaseAnalyticsRepository();

const navigationLinks = [
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
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userProfile = await userRepo.getUser(currentUser.uid);
          if (userProfile) {
            setProfile(userProfile);
            if (userProfile.dobDay) {
              setCoreNumbers(
                generateNumerologyProfile(
                  parseInt(userProfile.dobDay),
                  parseInt(userProfile.dobMonth),
                  parseInt(userProfile.dobYear),
                  userProfile.gender
                )
              );
            }
            analyticsRepo
              .logEvent({ eventName: 'app_open', params: {}, userId: currentUser.uid })
              .catch((err) => console.warn('Analytics error:', err));
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setProfile(null);
          setWalletBalance(0);
          setFullReport(null);
        }
      } else {
        setProfile(null);
        setCoreNumbers(null);
        setFullReport(null);
        setWalletBalance(0);
      }
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubWallet = walletRepo.subscribeToWallet(user.uid, (wallet) => {
      setWalletBalance(wallet?.balance || 0);
    });

    const unsubReport = reportRepo.subscribeToReport('rep_' + user.uid, (report) => {
      setFullReport(report);
    });

    userRepo.getUser(user.uid).then((p) => {
      if (p) {
        setProfile(p);
        if (p.dobDay) {
          setCoreNumbers(
            generateNumerologyProfile(
              parseInt(p.dobDay),
              parseInt(p.dobMonth),
              parseInt(p.dobYear),
              p.gender
            )
          );
        }
      }
    });

    return () => {
      unsubWallet();
      unsubReport();
    };
  }, [user]);

  if (!isConfigured) return <ConfigurationError />;
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen font-sans">
        Loading Destiny...
      </div>
    );
  }

  const handleLogout = async () => await signOut(auth);

  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen p-5">
        <h1 className="text-center mb-10 text-gradient">🔮 DestinyAI</h1>
        <AuthScreen onLogin={() => {}} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-gradient-to-br from-gray-50 via-white to-purple-50/30 min-h-screen p-5">
        <div className="flex justify-between items-center max-w-2xl mx-auto mb-5">
          <h1 className="text-gradient text-4xl">🔮 DestinyAI</h1>
          <Button variant="secondary" onClick={handleLogout} className="w-auto mb-0">
            Logout
          </Button>
        </div>
        <OnboardingScreen user={user} onComplete={() => window.location.reload()} />
      </div>
    );
  }

  const logo = (
    <Link href="/" className="no-underline text-inherit">
      <h1 className="nav-logo text-gradient m-0">🔮 DestinyAI</h1>
    </Link>
  );

  const welcomeText = (
    <span className="text-sm text-gray-500 font-normal hidden sm:inline">
      Welcome, {profile.displayName}
    </span>
  );

  const rightContent = (
    <>
      <div className="px-5 py-2.5 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full font-semibold text-white shadow-lg text-sm tracking-wide hover:shadow-xl transition-shadow">
        ₹{walletBalance}
      </div>
      <Button variant="secondary" onClick={handleLogout} className="w-auto mb-0 text-sm px-4 py-2">
        Logout
      </Button>
    </>
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-purple-50/30 min-h-screen">
      <Navigation logo={logo} links={navigationLinks} rightContent={rightContent} LinkComponent={Link}>
        {welcomeText}
      </Navigation>

      <main className="max-w-7xl mx-auto p-5 space-y-6">
        <WalletView userId={user.uid} />
        <Card title="Your Core Numerology" className="bg-gradient-to-br from-white to-primary-50/20">
          {coreNumbers ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="flex justify-around mb-5">
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200/50">
                    <div className="number-display text-6xl text-primary-600 mb-2">{coreNumbers.moolank}</div>
                    <div className="font-medium text-gray-700">Moolank</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50">
                    <div className="number-display text-6xl text-purple-600 mb-2">{coreNumbers.bhagyank}</div>
                    <div className="font-medium text-gray-700">Bhagyank</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50">
                    <div className="number-display text-6xl text-green-600 mb-2">{coreNumbers.kua}</div>
                    <div className="font-medium text-gray-700">Kua</div>
                  </div>
                </div>
                <div>
                  <strong>Missing Numbers:</strong>
                  <span className="text-red-600 ml-2">{coreNumbers.missingNumbers.join(', ')}</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="mb-3 font-medium text-gray-700">Loshu Grid</div>
                <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
                  {[
                    [4, 9, 2],
                    [3, 5, 7],
                    [8, 1, 6],
                  ]
                    .flat()
                    .map((num) => (
                      <div
                        key={num}
                        className={`aspect-square flex items-center justify-center border-2 rounded-lg font-bold text-xl transition-all duration-200 ${
                          coreNumbers.loshuGrid[num] > 0 
                            ? 'bg-gradient-to-br from-cyan-100 to-cyan-50 border-cyan-300 text-cyan-700 shadow-sm' 
                            : 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200 text-gray-400'
                        }`}
                      >
                        {coreNumbers.loshuGrid[num] > 0 ? num : ''}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div>Error calculating profile.</div>
          )}
        </Card>
        {coreNumbers && (
          <ReportGenerator
            profile={profile}
            coreNumbers={coreNumbers}
            walletBalance={walletBalance}
            existingReport={fullReport}
          />
        )}
        {fullReport && (
          <ChatInterface user={user} profile={profile} report={fullReport} walletBalance={walletBalance} />
        )}
      </main>
      <Footer links={footerLinks} LinkComponent={Link} />
    </div>
  );
}
