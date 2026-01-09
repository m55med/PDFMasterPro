// PDF Master Pro - Subscription Types

export type PlanType = 'free' | 'pro';
export type BillingCycle = 'monthly' | 'yearly';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface Subscription {
  plan: PlanType;
  billingCycle: BillingCycle | null;
  startedAt: Date | null;
  expiresAt: Date | null;
  provider: 'apple' | 'google' | null;
  transactionId: string | null;
}

export interface StorageInfo {
  usedBytes: number;
  limitBytes: number;
  isLimitReached: boolean;
}

// Plan limits and pricing
export const PLAN_CONFIG = {
  free: {
    storageLimitMB: 20,
    storageLimitBytes: 20 * 1024 * 1024, // 20 MB
    adsEnabled: true,
    price: 0,
  },
  pro: {
    storageLimitMB: -1, // Unlimited
    storageLimitBytes: -1,
    adsEnabled: false,
    prices: {
      monthly: 2,
      yearly: 15,
    },
  },
} as const;

export interface SubscriptionContextType {
  subscription: Subscription | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isPro: boolean;
  showAds: boolean;
  storageLimit: number;
  refreshSubscription: () => Promise<void>;
}
