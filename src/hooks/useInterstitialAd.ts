// PDF Master Pro - Interstitial Ad Hook
import { useCallback } from 'react';
import { useAds } from '../context';

/**
 * Hook to manage interstitial ads after tool operations
 * Call showAdAfterOperation() after a successful tool operation
 */
export const useInterstitialAd = () => {
  const {
    incrementToolUsage,
    shouldShowInterstitial,
    showInterstitial,
    isInterstitialReady,
  } = useAds();

  /**
   * Call this after a successful tool operation
   * It will track usage and show an interstitial if conditions are met
   */
  const showAdAfterOperation = useCallback(async () => {
    incrementToolUsage();

    if (shouldShowInterstitial()) {
      await showInterstitial();
    }
  }, [incrementToolUsage, shouldShowInterstitial, showInterstitial]);

  return {
    showAdAfterOperation,
    isInterstitialReady,
  };
};

export default useInterstitialAd;
