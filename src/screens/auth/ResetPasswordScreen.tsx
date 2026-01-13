// PDF Master Pro - Reset Password Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthStackParamList } from '../../types/navigation';
import { useTheme, useLanguage, useAuth } from '../../context';
import { Button, Input, Header } from '../../components/common';
import { Typography, Spacing } from '../../constants/theme';

type ResetPasswordNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;
type ResetPasswordRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ResetPasswordNavigationProp>();
  const route = useRoute<ResetPasswordRouteProp>();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { confirmPasswordReset, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  const { email, otp } = route.params;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

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

  const handleResetPassword = async () => {
    if (!validate()) return;

    try {
      await confirmPasswordReset(email, otp, password);
      Alert.alert(
        t.common.success,
        t.auth.passwordResetSuccess,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                })
              );
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || t.errors.generic);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (): { text: string; color: string; width: string } => {
    if (!password) return { text: '', color: colors.border, width: '0%' };
    if (password.length < 6) return { text: t.auth.weak, color: colors.error, width: '25%' };
    if (password.length < 8) return { text: t.auth.fair, color: colors.warning, width: '50%' };
    if (password.length < 10) return { text: t.auth.good, color: colors.info, width: '75%' };
    return { text: t.auth.strong, color: colors.success, width: '100%' };
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
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔑</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {t.auth.createNewPassword}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t.auth.createNewPasswordSubtitle}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label={t.auth.newPassword}
              placeholder={t.auth.enterNewPassword}
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
                      { backgroundColor: strength.color, width: strength.width as `${number}%` },
                    ]}
                  />
                </View>
                <Text style={[styles.strengthText, { color: strength.color }]}>
                  {strength.text}
                </Text>
              </View>
            )}

            <Input
              label={t.auth.confirmNewPassword}
              placeholder={t.auth.reenterPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button
              title={t.auth.resetPassword}
              onPress={handleResetPassword}
              loading={isLoading}
              fullWidth
              size="lg"
            />
          </View>

          {/* Password Requirements */}
          <View style={[styles.requirementsBox, { backgroundColor: colors.bgGray }]}>
            <Text style={[styles.requirementsTitle, { color: colors.textPrimary }]}>
              {t.auth.passwordRequirements}
            </Text>
            <View style={styles.requirement}>
              <Text style={[styles.checkmark, { color: password.length >= 8 ? colors.success : colors.textLight }]}>
                {password.length >= 8 ? '✓' : '○'}
              </Text>
              <Text style={[styles.requirementText, { color: colors.textSecondary }]}>
                {t.auth.minCharacters}
              </Text>
            </View>
            <View style={styles.requirement}>
              <Text style={[styles.checkmark, { color: /[A-Z]/.test(password) ? colors.success : colors.textLight }]}>
                {/[A-Z]/.test(password) ? '✓' : '○'}
              </Text>
              <Text style={[styles.requirementText, { color: colors.textSecondary }]}>
                {t.auth.upperCase}
              </Text>
            </View>
            <View style={styles.requirement}>
              <Text style={[styles.checkmark, { color: /[0-9]/.test(password) ? colors.success : colors.textLight }]}>
                {/[0-9]/.test(password) ? '✓' : '○'}
              </Text>
              <Text style={[styles.requirementText, { color: colors.textSecondary }]}>
                {t.auth.number}
              </Text>
            </View>
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
  requirementsBox: {
    padding: Spacing.md,
    borderRadius: 12,
  },
  requirementsTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.sm,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  checkmark: {
    fontSize: 14,
    marginRight: Spacing.sm,
    width: 20,
  },
  requirementText: {
    fontSize: Typography.fontSize.sm,
  },
});

export default ResetPasswordScreen;
