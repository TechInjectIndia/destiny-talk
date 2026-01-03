'use client';

import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '@destiny-ai/core';
import { FirebaseUserRepository, FirebaseWalletRepository, FirebaseAnalyticsRepository } from '@destiny-ai/database';
import toast from 'react-hot-toast';
import { Card, Button, Input } from '@destiny-ai/ui';

const userRepo = new FirebaseUserRepository();
const walletRepo = new FirebaseWalletRepository();
const analyticsRepo = new FirebaseAnalyticsRepository();

interface OnboardingScreenProps {
  user: User;
  onComplete: () => void;
}

export const OnboardingScreen = ({ user, onComplete }: OnboardingScreenProps) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    displayName: user.displayName || '',
    email: user.email || '',
    gender: 'male',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.dobDay || !formData.dobMonth || !formData.dobYear || !formData.displayName) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await userRepo.saveUser(user.uid, { ...formData, uid: user.uid });

      const wallet = await walletRepo.getWallet(user.uid);
      if (!wallet) {
        await walletRepo.createWallet(user.uid);
      }

      await analyticsRepo.logEvent({ eventName: 'onboarding_complete', params: { uid: user.uid }, userId: user.uid });
      toast.success('Profile saved successfully!');
      onComplete();
    } catch (e) {
      console.error(e);
      toast.error('Error saving profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-10">
      <Card title="Setup Your Profile" className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <p className="text-gray-600 mb-5">
          To generate accurate numerology reports, we need your birth details.
        </p>
        <Input
          label="Full Name"
          value={formData.displayName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, displayName: e.target.value })
          }
          placeholder="John Doe"
        />
        <div className="grid grid-cols-3 gap-2.5">
          <Input
            label="Day"
            value={formData.dobDay}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, dobDay: e.target.value })
            }
            placeholder="DD"
            type="number"
          />
          <Input
            label="Month"
            value={formData.dobMonth}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, dobMonth: e.target.value })
            }
            placeholder="MM"
            type="number"
          />
          <Input
            label="Year"
            value={formData.dobYear}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, dobYear: e.target.value })
            }
            placeholder="YYYY"
            type="number"
          />
        </div>
        <Input
          label="Time of Birth (Optional)"
          value={formData.tob || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, tob: e.target.value })
          }
          placeholder="HH:MM AM/PM"
        />
        <Input
          label="Place of Birth"
          value={formData.pob || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, pob: e.target.value })
          }
          placeholder="City, Country"
        />
        <div className="mb-5">
          <label className="block mb-1 text-sm font-medium text-gray-700">Gender</label>
          <select
            value={formData.gender}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Complete Profile'}
        </Button>
      </Card>
    </div>
  );
};

