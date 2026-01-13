// PDF Master Pro - Banner Ad Component
import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  BannerAd as GoogleBannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import { useSubscription } from '../../context';
import { AD_CONFIG } from '../../constants/adConfig';

interface BannerAdProps {
  size?: BannerAdSize;
  style?: object;
}

const BannerAd: React.FC<BannerAdProps> = ({
  size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
  style,
}) => {
  const { isPro } = useSubscription();
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Don't render for Pro users
  if (isPro) {
    return null;
  }

  // Use test ID in development
  const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : AD_CONFIG.BANNER_ID;

  if (hasError) {
    return null;
  }

  return (
    <View style={[styles.container, style, !isAdLoaded && styles.hidden]}>
      <GoogleBannerAd
        unitId={adUnitId}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          setIsAdLoaded(true);
          setHasError(false);
        }}
        onAdFailedToLoad={(error) => {
          console.log('Banner ad failed to load:', error);
          setHasError(true);
          setIsAdLoaded(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  hidden: {
    height: 0,
    opacity: 0,
  },
});

export default BannerAd;
