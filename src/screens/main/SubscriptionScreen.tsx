// PDF Master Pro - Subscription Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useLanguage, useSubscription, useStorage } from '../../context';
import { Card } from '../../components/common';
import { Typography, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import { PLAN_CONFIG, BillingCycle } from '../../types/subscription';

const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const { subscription, isPro, refreshSubscription } = useSubscription();
  const { formatBytes } = useStorage();
  const insets = useSafeAreaInsets();

  const [selectedPlan, setSelectedPlan] = useState<BillingCycle>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      // TODO: Integrate with in-app purchases (Apple/Google)
      // This will be implemented with react-native-iap
      Alert.alert(
        t.subscription?.comingSoon || 'Coming Soon',
        t.subscription?.iapComingSoon || 'In-app purchases will be available soon. Stay tuned!'
      );
    } catch (error: any) {
      Alert.alert(
        t.common.error,
        error.message || t.subscription?.purchaseFailed || 'Purchase failed'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsProcessing(true);
    try {
      // TODO: Implement restore purchases
      await refreshSubscription();
      Alert.alert(
        t.common.success,
        t.subscription?.restoreSuccess || 'Purchases restored successfully'
      );
    } catch (error: any) {
      Alert.alert(
        t.common.error,
        error.message || t.subscription?.restoreFailed || 'Failed to restore purchases'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getExpiryText = () => {
    if (!subscription?.expiresAt) return null;
    const expiryDate = subscription.expiresAt.toLocaleDateString();
    return `${t.subscription?.expiresOn || 'Expires on'}: ${expiryDate}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.primary,
            paddingTop: insets.top + Spacing.md,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>{isRTL ? '→' : '←'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t.subscription?.title || 'Subscription'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Pro Badge */}
        <View style={styles.badgeContainer}>
          <View style={[styles.proBadge, { backgroundColor: colors.bgWhite }]}>
            <Text style={[styles.proText, { color: colors.primary }]}>PRO</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {t.subscription?.unlockAll || 'Unlock all features'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Status */}
        {isPro && (
          <Card style={{ ...styles.card, borderLeftWidth: 4, borderLeftColor: '#22C55E' }}>
            <View style={styles.statusRow}>
              <Text style={styles.statusIcon}>✓</Text>
              <View style={styles.statusContent}>
                <Text style={[styles.statusTitle, { color: colors.success }]}>
                  {t.subscription?.activeSubscription || 'Active Subscription'}
                </Text>
                {getExpiryText() && (
                  <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
                    {getExpiryText()}
                  </Text>
                )}
              </View>
            </View>
          </Card>
        )}

        {/* Features List */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {t.subscription?.proFeatures || 'Pro Features'}
          </Text>

          <FeatureItem
            icon="🚫"
            title={t.subscription?.noAds || 'No Advertisements'}
            description={t.subscription?.noAdsDesc || 'Enjoy an ad-free experience'}
            colors={colors}
          />
          <FeatureItem
            icon="💾"
            title={t.subscription?.unlimitedStorage || 'Unlimited Local Storage'}
            description={
              t.subscription?.unlimitedStorageDesc ||
              `Free: ${formatBytes(PLAN_CONFIG.free.storageLimitBytes)} | Pro: Unlimited`
            }
            colors={colors}
          />
          <FeatureItem
            icon="🔒"
            title={t.subscription?.privacy || '100% Private'}
            description={t.subscription?.privacyDesc || 'No cloud storage, no data sharing'}
            colors={colors}
          />
          <FeatureItem
            icon="⚡"
            title={t.subscription?.allTools || 'All PDF Tools'}
            description={t.subscription?.allToolsDesc || 'Access all current and future tools'}
            colors={colors}
          />
        </Card>

        {/* Pricing Plans */}
        {!isPro && (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
              {t.subscription?.choosePlan || 'Choose Your Plan'}
            </Text>

            {/* Yearly Plan */}
            <TouchableOpacity
              style={[
                styles.planOption,
                {
                  borderColor: selectedPlan === 'yearly' ? colors.primary : colors.border,
                  backgroundColor: selectedPlan === 'yearly' ? colors.primary + '10' : colors.bgWhite,
                },
              ]}
              onPress={() => setSelectedPlan('yearly')}
            >
              <View style={styles.planHeader}>
                <View style={styles.planRadio}>
                  {selectedPlan === 'yearly' && (
                    <View style={[styles.planRadioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <View style={styles.planInfo}>
                  <Text style={[styles.planName, { color: colors.textPrimary }]}>
                    {t.subscription?.yearly || 'Yearly'}
                  </Text>
                  <Text style={[styles.planDesc, { color: colors.textSecondary }]}>
                    {t.subscription?.bestValue || 'Best Value - Save 37%'}
                  </Text>
                </View>
                <View style={styles.planPriceContainer}>
                  <Text style={[styles.planPrice, { color: colors.primary }]}>
                    ${PLAN_CONFIG.pro.prices.yearly}
                  </Text>
                  <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>
                    /{t.subscription?.year || 'year'}
                  </Text>
                </View>
              </View>
              {selectedPlan === 'yearly' && (
                <View style={[styles.saveBadge, { backgroundColor: colors.success }]}>
                  <Text style={styles.saveBadgeText}>
                    {t.subscription?.save || 'SAVE'} $9
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Monthly Plan */}
            <TouchableOpacity
              style={[
                styles.planOption,
                {
                  borderColor: selectedPlan === 'monthly' ? colors.primary : colors.border,
                  backgroundColor: selectedPlan === 'monthly' ? colors.primary + '10' : colors.bgWhite,
                },
              ]}
              onPress={() => setSelectedPlan('monthly')}
            >
              <View style={styles.planHeader}>
                <View style={styles.planRadio}>
                  {selectedPlan === 'monthly' && (
                    <View style={[styles.planRadioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <View style={styles.planInfo}>
                  <Text style={[styles.planName, { color: colors.textPrimary }]}>
                    {t.subscription?.monthly || 'Monthly'}
                  </Text>
                  <Text style={[styles.planDesc, { color: colors.textSecondary }]}>
                    {t.subscription?.flexible || 'Flexible billing'}
                  </Text>
                </View>
                <View style={styles.planPriceContainer}>
                  <Text style={[styles.planPrice, { color: colors.primary }]}>
                    ${PLAN_CONFIG.pro.prices.monthly}
                  </Text>
                  <Text style={[styles.planPeriod, { color: colors.textSecondary }]}>
                    /{t.subscription?.month || 'month'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Subscribe Button */}
            <TouchableOpacity
              style={[styles.subscribeButton, { backgroundColor: colors.primary }]}
              onPress={handleSubscribe}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.subscribeButtonText}>
                  {t.subscription?.subscribe || 'Subscribe Now'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Restore Purchases */}
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestorePurchases}
              disabled={isProcessing}
            >
              <Text style={[styles.restoreButtonText, { color: colors.primary }]}>
                {t.subscription?.restore || 'Restore Purchases'}
              </Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Free Plan Info */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {t.subscription?.freePlan || 'Free Plan'}
          </Text>
          <View style={styles.freeFeatures}>
            <Text style={[styles.freeFeature, { color: colors.textSecondary }]}>
              • {t.subscription?.freeStorage || `${PLAN_CONFIG.free.storageLimitMB} MB local storage`}
            </Text>
            <Text style={[styles.freeFeature, { color: colors.textSecondary }]}>
              • {t.subscription?.freeAds || 'Contains advertisements'}
            </Text>
            <Text style={[styles.freeFeature, { color: colors.textSecondary }]}>
              • {t.subscription?.freeTools || 'Access to all PDF tools'}
            </Text>
          </View>
        </Card>

        {/* Privacy Notice */}
        <View style={styles.privacyNotice}>
          <Text style={styles.privacyIcon}>🔐</Text>
          <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
            {t.subscription?.privacyNotice ||
              'Your files are processed locally on your device. We never upload, store, or share your documents.'}
          </Text>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </View>
  );
};

// Feature Item Component
interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
  colors: any;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description, colors }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <View style={styles.featureContent}>
      <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
  },
  placeholder: {
    width: 40,
  },
  badgeContainer: {
    alignItems: 'center',
  },
  proBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Shadow.md,
  },
  proText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: Typography.fontSize.base,
  },
  scrollContent: {
    padding: Spacing.md,
    marginTop: -Spacing.md,
  },
  card: {
    marginBottom: Spacing.md,
  },
  statusCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
    color: '#22C55E',
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
  statusSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  cardTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  featureDesc: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  planOption: {
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  planRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
  planDesc: {
    fontSize: Typography.fontSize.sm,
  },
  planPriceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  planPeriod: {
    fontSize: Typography.fontSize.xs,
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  saveBadgeText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  subscribeButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
  restoreButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  freeFeatures: {
    gap: Spacing.xs,
  },
  freeFeature: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  privacyIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  privacyText: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    lineHeight: 18,
  },
});

export default SubscriptionScreen;
