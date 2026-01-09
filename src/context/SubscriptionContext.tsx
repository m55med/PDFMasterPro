// PDF Master Pro - Subscription Context
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Subscription,
  UserProfile,
  SubscriptionContextType,
  PLAN_CONFIG,
} from '../types/subscription';
import {
  isSubscriptionActive,
  getSubscription,
  getUserProfile,
} from '../services/firebase/firestore';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Computed values
  const isPro = isSubscriptionActive(subscription);
  const showAds = !isPro; // Free users see ads
  const storageLimit = isPro
    ? PLAN_CONFIG.pro.storageLimitBytes
    : PLAN_CONFIG.free.storageLimitBytes;

  // Fetch user data when authenticated
  // Note: Real-time listeners require Firestore native module to be fully installed
  // Falling back to one-time fetches for compatibility
  useEffect(() => {
    if (!user?.uid || !isAuthenticated) {
      setSubscription(null);
      setUserProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let mounted = true;

    const fetchData = async () => {
      try {
        const [profile, sub] = await Promise.all([
          getUserProfile(user.uid),
          getSubscription(user.uid),
        ]);

        if (mounted) {
          setUserProfile(profile);
          setSubscription(sub);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [user?.uid, isAuthenticated]);

  const refreshSubscription = async (): Promise<void> => {
    if (!user?.uid) return;

    try {
      const [profile, sub] = await Promise.all([
        getUserProfile(user.uid),
        getSubscription(user.uid),
      ]);

      setUserProfile(profile);
      setSubscription(sub);
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    }
  };

  const value: SubscriptionContextType = {
    subscription,
    userProfile,
    isLoading,
    isPro,
    showAds,
    storageLimit,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export default SubscriptionContext;
