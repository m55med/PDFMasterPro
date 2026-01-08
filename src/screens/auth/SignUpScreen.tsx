// PDF Master Pro - Sign Up Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthStackParamList } from '../../types/navigation';
import { useTheme, useLanguage, useAuth } from '../../context';
import { Button, Input, Header } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';

type SignUpNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpNavigationProp>();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { signUp, googleSignIn, appleSignIn, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = t.auth.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t.auth.invalidEmail;
    }

    if (!password) {
      newErrors.password = t.auth.passwordRequired;
    } else if (password.length < 8) {
      newErrors.password = t.auth.passwordTooShort;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t.auth.passwordsDoNotMatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    try {
      await signUp({ email, password });
      Alert.alert(
        t.common.success,
        t.auth.checkEmail,
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || t.errors.signUpFailed);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || t.errors.signUpFailed);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await appleSignIn();
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || t.errors.signUpFailed);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (): { text: string; color: string; width: string } => {
    if (!password) return { text: '', color: colors.border, width: '0%' };
    if (password.length < 6) return { text: 'Weak', color: colors.error, width: '25%' };
    if (password.length < 8) return { text: 'Fair', color: colors.warning, width: '50%' };
    if (password.length < 10) return { text: 'Good', color: colors.info, width: '75%' };
    return { text: 'Strong', color: colors.success, width: '100%' };
  };

  const strength = getPasswordStrength();

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {t.auth.createAccount}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Create your account to get started.
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
              error={errors.email}
            />

            <Input
              label={t.auth.password}
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

            {/* Password Strength */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={[styles.strengthBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.strengthFill,
                      { backgroundColor: strength.color, width: strength.width },
                    ]}
                  />
                </View>
                <Text style={[styles.strengthText, { color: strength.color }]}>
                  {strength.text}
                </Text>
              </View>
            )}

            <Input
              label={t.auth.confirmPassword}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button
              title={t.auth.createAccount}
              onPress={handleSignUp}
              loading={isLoading}
              fullWidth
              size="lg"
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
              {t.auth.orContinueWith}
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={[styles.socialButton, { borderColor: colors.border }]}
              onPress={handleGoogleSignIn}
            >
              <Text style={styles.socialIcon}>🔵</Text>
              <Text style={[styles.socialText, { color: colors.textPrimary }]}>
                Google
              </Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.socialButton, { borderColor: colors.border }]}
                onPress={handleAppleSignIn}
              >
                <Text style={styles.socialIcon}>🍎</Text>
                <Text style={[styles.socialText, { color: colors.textPrimary }]}>
                  Apple
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Terms */}
          <Text style={[styles.terms, { color: colors.textSecondary }]}>
            {t.auth.agreeToTerms}{' '}
            <Text style={{ color: colors.primary }}>{t.auth.termsOfService}</Text>
            {' '}{t.auth.and}{' '}
            <Text style={{ color: colors.primary }}>{t.auth.privacyPolicy}</Text>
          </Text>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                {t.auth.login}
              </Text>
            </TouchableOpacity>
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
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: -Spacing.sm,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: Typography.fontSize.sm,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    gap: Spacing.sm,
  },
  socialIcon: {
    fontSize: 20,
  },
  socialText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  terms: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: Typography.fontSize.base,
  },
  footerLink: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
});

export default SignUpScreen;
