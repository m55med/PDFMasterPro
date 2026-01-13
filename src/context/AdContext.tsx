// PDF Master Pro - Ad Context
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import mobileAds, {
  InterstitialAd,
  RewardedAd,
  RewardedInterstitialAd,
  AdEventType,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { useSubscription } from './SubscriptionContext';
import { AD_CONFIG, AD_SETTINGS } from '../constants/adConfig';

interface AdContextType {
  // Ad state
  isAdsInitialized: boolean;
  isInterstitialReady: boolean;
  isRewardedReady: boolean;
  isRewardedInterstitialReady: boolean;

  // Ad methods
  showInterstitial: () => Promise<boolean>;
  showRewarded: (onReward?: () => void) => Promise<boolean>;
  showRewardedInterstitial: (onReward?: () => void) => Promise<boolean>;

  // Track tool usage for interstitial frequency
  incrementToolUsage: () => void;
  shouldShowInterstitial: () => boolean;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isPro } = useSubscription();

  // State
  const [isAdsInitialized, setIsAdsInitialized] = useState(false);
  const [isInterstitialReady, setIsInterstitialReady] = useState(false);
  const [isRewardedReady, setIsRewardedReady] = useState(false);
  const [isRewardedInterstitialReady, setIsRewardedInterstitialReady] = useState(false);

  // Refs for ad instances
  const interstitialRef = useRef<InterstitialAd | null>(null);
  const rewardedRef = useRef<RewardedAd | null>(null);
  const rewardedInterstitialRef = useRef<RewardedInterstitialAd | null>(null);

  // Tool usage tracking
  const toolUsageCount = useRef(0);
  const lastInterstitialTime = useRef(0);

  // Initialize Mobile Ads SDK
  useEffect(() => {
    const initializeAds = async () => {
      try {
        await mobileAds().initialize();
        console.log('Mobile Ads SDK initialized');
        setIsAdsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Mobile Ads SDK:', error);
      }
    };

    if (!isPro) {
      initializeAds();
    }
  }, [isPro]);

  // Load Interstitial Ad
  const loadInterstitial = useCallback(() => {
    if (isPro) return;

    const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : AD_CONFIG.INTERSTITIAL_ID;
    const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setIsInterstitialReady(true);
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setIsInterstitialReady(false);
      // Reload after closed
      loadInterstitial();
    });

    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('Interstitial ad error:', error);
      setIsInterstitialReady(false);
      // Retry after delay
      setTimeout(loadInterstitial, 30000);
    });

    interstitialRef.current = interstitial;
    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [isPro]);

  // Load Rewarded Ad
  const loadRewarded = useCallback(() => {
    if (isPro) return;

    const adUnitId = __DEV__ ? TestIds.REWARDED : AD_CONFIG.REWARDED_ID;
    const rewarded = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setIsRewardedReady(true);
    });

    const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      setIsRewardedReady(false);
      // Reload after closed
      loadRewarded();
    });

    const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('Rewarded ad error:', error);
      setIsRewardedReady(false);
      // Retry after delay
      setTimeout(loadRewarded, 30000);
    });

    rewardedRef.current = rewarded;
    rewarded.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [isPro]);

  // Load Rewarded Interstitial Ad
  const loadRewardedInterstitial = useCallback(() => {
    if (isPro) return;

    const adUnitId = __DEV__ ? TestIds.REWARDED_INTERSTITIAL : AD_CONFIG.REWARDED_INTERSTITIAL_ID;
    const rewardedInterstitial = RewardedInterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = rewardedInterstitial.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setIsRewardedInterstitialReady(true);
      }
    );

    const unsubscribeClosed = rewardedInterstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setIsRewardedInterstitialReady(false);
      // Reload after closed
      loadRewardedInterstitial();
    });

    const unsubscribeError = rewardedInterstitial.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.log('Rewarded Interstitial ad error:', error);
        setIsRewardedInterstitialReady(false);
        // Retry after delay
        setTimeout(loadRewardedInterstitial, 30000);
      }
    );

    rewardedInterstitialRef.current = rewardedInterstitial;
    rewardedInterstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [isPro]);

  // Initialize ads when SDK is ready
  useEffect(() => {
    if (isAdsInitialized && !isPro) {
      loadInterstitial();
      loadRewarded();
      loadRewardedInterstitial();
    }
  }, [isAdsInitialized, isPro, loadInterstitial, loadRewarded, loadRewardedInterstitial]);

  // Show Interstitial
  const showInterstitial = useCallback(async (): Promise<boolean> => {
    if (isPro) return false;

    if (interstitialRef.current && isInterstitialReady) {
      try {
        await interstitialRef.current.show();
        lastInterstitialTime.current = Date.now();
        return true;
      } catch (error) {
        console.error('Failed to show interstitial:', error);
        return false;
      }
    }
    return false;
  }, [isPro, isInterstitialReady]);

  // Show Rewarded
  const showRewarded = useCallback(
    async (onReward?: () => void): Promise<boolean> => {
      if (isPro) return false;

      if (rewardedRef.current && isRewardedReady) {
        try {
          // Add reward listener
          const unsubscribeEarned = rewardedRef.current.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            () => {
              onReward?.();
              unsubscribeEarned();
            }
          );

          await rewardedRef.current.show();
          return true;
        } catch (error) {
          console.error('Failed to show rewarded ad:', error);
          return false;
        }
      }
      return false;
    },
    [isPro, isRewardedReady]
  );

  // Show Rewarded Interstitial
  const showRewardedInterstitial = useCallback(
    async (onReward?: () => void): Promise<boolean> => {
      if (isPro) return false;

      if (rewardedInterstitialRef.current && isRewardedInterstitialReady) {
        try {
          // Add reward listener
          const unsubscribeEarned = rewardedInterstitialRef.current.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            () => {
              onReward?.();
              unsubscribeEarned();
            }
          );

          await rewardedInterstitialRef.current.show();
          return true;
        } catch (error) {
          console.error('Failed to show rewarded interstitial:', error);
          return false;
        }
      }
      return false;
    },
    [isPro, isRewardedInterstitialReady]
  );

  // Track tool usage
  const incrementToolUsage = useCallback(() => {
    toolUsageCount.current += 1;
  }, []);

  // Check if should show interstitial
  const shouldShowInterstitial = useCallback((): boolean => {
    if (isPro) return false;

    const now = Date.now();
    const timeSinceLastAd = now - lastInterstitialTime.current;
    const isFrequencyMet = toolUsageCount.current >= AD_SETTINGS.INTERSTITIAL_FREQUENCY;
    const isCooldownPassed = timeSinceLastAd >= AD_SETTINGS.INTERSTITIAL_COOLDOWN;

    if (isFrequencyMet && isCooldownPassed && isInterstitialReady) {
      toolUsageCount.current = 0;
      return true;
    }
    return false;
  }, [isPro, isInterstitialReady]);

  return (
    <AdContext.Provider
      value={{
        isAdsInitialized,
        isInterstitialReady,
        isRewardedReady,
        isRewardedInterstitialReady,
        showInterstitial,
        showRewarded,
        showRewardedInterstitial,
        incrementToolUsage,
        shouldShowInterstitial,
      }}
    >
      {children}
    </AdContext.Provider>
  );
};

export const useAds = (): AdContextType => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
};

export default AdContext;
