// PDF Master Pro - AdMob Configuration
import { Platform } from 'react-native';

// Test IDs from Google (for development)
const TEST_IDS = {
  APP_ID: {
    ios: 'ca-app-pub-3940256099942544~1458002511',
    android: 'ca-app-pub-3940256099942544~3347511713',
  },
  BANNER: {
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
  },
  INTERSTITIAL: {
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
  },
  REWARDED_INTERSTITIAL: {
    ios: 'ca-app-pub-3940256099942544/6978759866',
    android: 'ca-app-pub-3940256099942544/5354046379',
  },
  REWARDED: {
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
  },
};

// Production IDs
const PRODUCTION_IDS = {
  APP_ID: {
    ios: 'ca-app-pub-3940256099942544~1458002511', // Replace with real iOS App ID when available
    android: 'ca-app-pub-2784626367965493~7954494055',
  },
  BANNER: {
    ios: 'ca-app-pub-3940256099942544/2934735716', // Replace with real iOS Banner ID
    android: 'ca-app-pub-2784626367965493/7260946219',
  },
  INTERSTITIAL: {
    ios: 'ca-app-pub-3940256099942544/4411468910', // Replace with real iOS Interstitial ID
    android: 'ca-app-pub-2784626367965493/1071970050',
  },
  REWARDED_INTERSTITIAL: {
    ios: 'ca-app-pub-3940256099942544/6978759866', // Replace with real iOS Rewarded Interstitial ID
    android: 'ca-app-pub-2784626367965493/9197694470',
  },
  REWARDED: {
    ios: 'ca-app-pub-3940256099942544/1712485313', // Replace with real iOS Rewarded ID
    android: 'ca-app-pub-2784626367965493/2008619533',
  },
};

// Use test IDs in development, production IDs in release
const IS_DEVELOPMENT = __DEV__;
const AD_IDS = IS_DEVELOPMENT ? TEST_IDS : PRODUCTION_IDS;

export const AD_CONFIG = {
  // App ID
  APP_ID: Platform.select({
    ios: AD_IDS.APP_ID.ios,
    android: AD_IDS.APP_ID.android,
  }) || AD_IDS.APP_ID.android,

  // Banner Ad Unit ID
  BANNER_ID: Platform.select({
    ios: AD_IDS.BANNER.ios,
    android: AD_IDS.BANNER.android,
  }) || AD_IDS.BANNER.android,

  // Interstitial Ad Unit ID
  INTERSTITIAL_ID: Platform.select({
    ios: AD_IDS.INTERSTITIAL.ios,
    android: AD_IDS.INTERSTITIAL.android,
  }) || AD_IDS.INTERSTITIAL.android,

  // Rewarded Interstitial Ad Unit ID
  REWARDED_INTERSTITIAL_ID: Platform.select({
    ios: AD_IDS.REWARDED_INTERSTITIAL.ios,
    android: AD_IDS.REWARDED_INTERSTITIAL.android,
  }) || AD_IDS.REWARDED_INTERSTITIAL.android,

  // Rewarded Ad Unit ID
  REWARDED_ID: Platform.select({
    ios: AD_IDS.REWARDED.ios,
    android: AD_IDS.REWARDED.android,
  }) || AD_IDS.REWARDED.android,

  // Ad display settings
  SETTINGS: {
    // Show interstitial after every N tool uses
    INTERSTITIAL_FREQUENCY: 2,
    // Minimum time between interstitials (in milliseconds)
    INTERSTITIAL_COOLDOWN: 60000, // 1 minute
    // Banner position
    BANNER_POSITION: 'bottom' as const,
  },
};

// Export individual IDs for convenience
export const {
  APP_ID,
  BANNER_ID,
  INTERSTITIAL_ID,
  REWARDED_INTERSTITIAL_ID,
  REWARDED_ID,
  SETTINGS: AD_SETTINGS,
} = AD_CONFIG;

export default AD_CONFIG;
