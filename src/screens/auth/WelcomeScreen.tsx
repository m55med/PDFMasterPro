// PDF Master Pro - Welcome Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthStackParamList } from '../../types/navigation';
import { useTheme, useLanguage } from '../../context';
import { Button } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';

const { width } = Dimensions.get('window');

type WelcomeNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeNavigationProp>();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.bgWhite }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Section - Illustration */}
      <View style={styles.topSection}>
        <View style={[styles.illustrationContainer, { backgroundColor: colors.primaryLight }]}>
          <View style={styles.iconGrid}>
            {['📎', '✂️', '📦', '🔄'].map((icon, index) => (
              <View
                key={index}
                style={[
                  styles.iconBox,
                  { backgroundColor: colors.bgWhite },
                ]}
              >
                <Text style={styles.icon}>{icon}</Text>
              </View>
            ))}
          </View>
          <View style={styles.iconGrid}>
            {['🔐', '💧', '🔢', '👁️'].map((icon, index) => (
              <View
                key={index}
                style={[
                  styles.iconBox,
                  { backgroundColor: colors.bgWhite },
                ]}
              >
                <Text style={styles.icon}>{icon}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Bottom Section - Content */}
      <View
        style={[
          styles.bottomSection,
          { backgroundColor: colors.bgWhite, paddingBottom: insets.bottom + Spacing.lg },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>PDF</Text>
          </View>
        </View>

        {/* Title & Subtitle */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t.auth.welcome}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t.auth.welcomeSubtitle}
        </Text>

        {/* Features */}
        <View style={styles.features}>
          {[
            { icon: '🔒', text: '100% Private & Secure' },
            { icon: '⚡', text: 'Fast Local Processing' },
            { icon: '🌍', text: 'Works Offline' },
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                {feature.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <Button
            title={t.auth.getStarted}
            onPress={() => navigation.navigate('SignUp')}
            fullWidth
            size="lg"
          />
          <Button
            title={t.auth.haveAccount}
            onPress={() => navigation.navigate('Login')}
            variant="ghost"
            fullWidth
            size="lg"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  illustrationContainer: {
    width: width * 0.85,
    aspectRatio: 1.2,
    borderRadius: BorderRadius.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    fontSize: 28,
  },
  bottomSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    marginTop: -Spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.xl,
  },
  featureItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
    maxWidth: 80,
  },
  buttons: {
    gap: Spacing.sm,
  },
});

export default WelcomeScreen;
