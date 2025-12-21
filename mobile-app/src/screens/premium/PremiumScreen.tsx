/**
 * Premium Paywall Screen
 * Shows subscription plans and handles purchases
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { Button, Card } from '../../components/common';
import { subscriptionPlans, SubscriptionService } from '../../services/subscription';
import { useUserStore } from '../../store';

export default function PremiumScreen({ navigation }: any) {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [purchasing, setPurchasing] = useState(false);
  const updateSubscription = useUserStore((state) => state.updateSubscription);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const success = await SubscriptionService.purchaseSubscription(selectedPlan);
      
      if (success) {
        updateSubscription({
          plan: selectedPlan as any,
          status: 'active',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });
        
        Alert.alert(
          'Success! 🎉',
          'You now have access to all premium features',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process purchase. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      const success = await SubscriptionService.restorePurchases();
      if (success) {
        Alert.alert('Success', 'Your purchases have been restored!');
      } else {
        Alert.alert('Info', 'No purchases found to restore.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases.');
    }
  };

  const paidPlans = subscriptionPlans.filter(p => p.id !== 'free');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>⭐</Text>
          <Text style={styles.title}>Upgrade to Pro</Text>
          <Text style={styles.subtitle}>
            Unlock all features and get unlimited access
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          {[
            { icon: '🛠️', title: 'All PDF Tools', desc: 'Access all tools' },
            { icon: '∞', title: 'Unlimited', desc: 'No daily limits' },
            { icon: '☁️', title: 'Cloud Sync', desc: 'Up to 20GB storage' },
            { icon: '🔍', title: 'OCR & Advanced', desc: 'Premium features' },
            { icon: '📁', title: 'Large Files', desc: 'Up to 100MB' },
            { icon: '🚫', title: 'No Ads', desc: 'Ad-free experience' },
          ].map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.desc}</Text>
            </Card>
          ))}
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {paidPlans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id)}
            >
              <Card
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.planCardSelected,
                ]}
              >
                {plan.id === 'yearly' && (
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveText}>SAVE 33%</Text>
                  </View>
                )}
                
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.planPrice}>${plan.price}</Text>
                    <Text style={styles.planPeriod}>
                      {plan.id === 'yearly' ? '/year' : '/month'}
                    </Text>
                  </View>
                </View>

                <View style={styles.featuresContainer}>
                  {plan.features.slice(0, 4).map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Text style={styles.checkmark}>✓</Text>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          Subscription automatically renews unless auto-renew is turned off at
          least 24-hours before the end of the current period.
        </Text>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          onPress={handlePurchase}
          loading={purchasing}
          disabled={purchasing}
          fullWidth
          size="lg"
        >
          {purchasing ? 'Processing...' : 'Start Free Trial'}
        </Button>
        
        <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing.lg,
  },
  emoji: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.xl,
  },
  featureCard: {
    width: '48%',
    marginRight: '4%',
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  featureTitle: {
    ...theme.typography.captionMedium,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  featureDesc: {
    ...theme.typography.small,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  plansContainer: {
    paddingHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.xl,
  },
  planCard: {
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  saveText: {
    ...theme.typography.small,
    color: '#fff',
    fontWeight: '700',
  },
  planHeader: {
    marginBottom: theme.spacing.lg,
  },
  planName: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    ...theme.typography.h2,
    color: theme.colors.primary,
  },
  planPeriod: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  featuresContainer: {
    gap: theme.spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 16,
    color: theme.colors.success,
    marginRight: theme.spacing.sm,
  },
  featureText: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
  },
  terms: {
    ...theme.typography.small,
    color: theme.colors.text.light,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  footer: {
    padding: theme.spacing.base,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  restoreButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  restoreText: {
    ...theme.typography.bodySemibold,
    color: theme.colors.primary,
  },
});
