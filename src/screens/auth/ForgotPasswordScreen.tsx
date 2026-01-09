// PDF Master Pro - Forgot Password Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthStackParamList } from '../../types/navigation';
import { useTheme, useLanguage, useAuth } from '../../context';
import { Button, Input, Header } from '../../components/common';
import { Typography, Spacing } from '../../constants/theme';

type ForgotPasswordNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordNavigationProp>();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { resetPassword, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const validate = (): boolean => {
    if (!email.trim()) {
      setError(t.auth.emailRequired);
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t.auth.invalidEmail);
      return false;
    }
    setError('');
    return true;
  };

  const handleResetPassword = async () => {
    if (!validate()) return;

    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || t.errors.generic);
    }
  };

  if (emailSent) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgWhite }]}>
        <Header showBack title="" />

        <View style={styles.successContainer}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📧</Text>
          </View>

          {/* Success Message */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t.auth.checkYourEmail}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t.auth.resetLinkSent}
          </Text>
          <Text style={[styles.emailText, { color: colors.primary }]}>
            {email}
          </Text>

          {/* Info Box */}
          <View style={[styles.infoBox, { backgroundColor: colors.bgGray }]}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {t.auth.checkSpam}
            </Text>
          </View>

          {/* Back to Login */}
          <Button
            title={t.auth.backToLogin}
            onPress={() => navigation.navigate('Login')}
            fullWidth
            size="lg"
            style={{ marginTop: Spacing.xl }}
          />

          {/* Resend Link */}
          <TouchableOpacity
            style={styles.resendContainer}
            onPress={() => setEmailSent(false)}
          >
            <Text style={[styles.resendText, { color: colors.textSecondary }]}>
              {t.auth.didntReceiveEmail}{' '}
            </Text>
            <Text style={[styles.resendLink, { color: colors.primary }]}>
              {t.auth.resendEmail}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgWhite }]}>
      <Header showBack title="" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.lg },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔐</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {t.auth.forgotPassword}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t.auth.forgotPasswordSubtitle}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label={t.auth.email}
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={error}
            />

            <Button
              title={t.auth.sendResetLink}
              onPress={handleResetPassword}
              loading={isLoading}
              fullWidth
              size="lg"
            />
          </View>

          {/* Info */}
          <View style={[styles.infoBox, { backgroundColor: colors.bgGray }]}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {t.auth.resetLinkInfo}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  successContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  icon: {
    fontSize: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginTop: Spacing.sm,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.md,
    width: '100%',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    lineHeight: 20,
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
  },
  resendText: {
    fontSize: Typography.fontSize.base,
  },
  resendLink: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
});

export default ForgotPasswordScreen;
