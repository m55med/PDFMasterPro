/**
 * User Store
 * Manages user authentication and profile
 */

import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  subscription: {
    plan: 'free' | 'monthly' | 'yearly' | 'lifetime';
    status: 'active' | 'expired' | 'cancelled';
    expiresAt?: Date;
  };
  usage: {
    filesProcessed: number;
    lastResetDate: Date;
    storageUsed: number;
  };
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
  };
}

interface UserState {
  user: User | null;
  isPro: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  updateSubscription: (subscription: User['subscription']) => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isPro: false,
  isAuthenticated: false,
  
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isPro: user?.subscription.status === 'active' && user?.subscription.plan !== 'free',
    }),
  
  updateSubscription: (subscription) =>
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, subscription };
      return {
        user: updatedUser,
        isPro: subscription.status === 'active' && subscription.plan !== 'free',
      };
    }),
  
  updatePreferences: (preferences) =>
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          preferences: { ...state.user.preferences, ...preferences },
        },
      };
    }),
  
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isPro: false,
    }),
}));
