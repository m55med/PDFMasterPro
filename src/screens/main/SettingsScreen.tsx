// PDF Master Pro - Settings Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useLanguage, useAuth, useSubscription, useStorage } from '../../context';
import { Card } from '../../components/common';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LANGUAGES } from '../../constants/config';
import { LanguageCode } from '../../i18n';

// App Store URLs (replace with real URLs when published)
const APP_STORE_URL = 'https://apps.apple.com/app/pdf-master-pro/id123456789';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.pdfmasterpro';

interface SettingsItemProps {
  icon: string;
  title: string;
  value?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  showArrow?: boolean;
  colors: {
    textPrimary: string;
    textSecondary: string;
    textLight: string;
  };
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  title,
  value,
  onPress,
  rightComponent,
  showArrow = true,
  colors,
}) => (
  <TouchableOpacity
    style={styles.settingsItem}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <Text style={styles.settingsIcon}>{icon}</Text>
    <View style={styles.settingsInfo}>
      <Text style={[styles.settingsTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      {value && (
        <Text style={[styles.settingsValue, { color: colors.textSecondary }]}>
          {value}
        </Text>
      )}
    </View>
    {rightComponent}
    {!rightComponent && onPress && showArrow && (
      <Text style={[styles.arrow, { color: colors.textLight }]}>→</Text>
    )}
  </TouchableOpacity>
);

interface SectionTitleProps {
  title: string;
  colors: { textSecondary: string };
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, colors }) => (
  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
    {title}
  </Text>
);

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const { storageLimit, isPro } = useSubscription();
  const { storageInfo } = useStorage();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState(true);

  // Calculate storage display values
  const usedMB = (storageInfo.usedBytes / (1024 * 1024)).toFixed(1);
  const limitMB = storageLimit === -1 ? '∞' : (storageLimit / (1024 * 1024)).toFixed(0);
  const usagePercent = storageLimit === -1 ? 0 : Math.min((storageInfo.usedBytes / storageLimit) * 100, 100);

  const handleLogout = () => {
    Alert.alert(
      t.auth.logout,
      'Are you sure you want to logout?',
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.auth.logout,
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleLanguageChange = () => {
    Alert.alert(
      t.settings.language,
      'Select your preferred language',
      LANGUAGES.map((lang) => ({
        text: `${lang.flag} ${lang.nativeName}`,
        onPress: () => setLanguage(lang.code as LanguageCode),
      }))
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      t.settings.clearCache,
      'Are you sure you want to clear all cached data?',
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.confirm,
          onPress: () => {
            // TODO: Clear cache
            Alert.alert(t.common.success, t.settings.cacheCleared);
          },
        },
      ]
    );
  };

  const handleRateApp = () => {
    const storeUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
    Linking.openURL(storeUrl).catch(() => {
      Alert.alert(
        language === 'ar' ? 'خطأ' : 'Error',
        language === 'ar' ? 'لا يمكن فتح المتجر' : 'Cannot open store'
      );
    });
  };

  const handleShareApp = async () => {
    try {
      const storeUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
      const message = language === 'ar'
        ? `جرب تطبيق PDF Master Pro - أفضل تطبيق لإدارة ملفات PDF! ${storeUrl}`
        : `Check out PDF Master Pro - The best PDF management app! ${storeUrl}`;

      await Share.share({
        message,
        url: storeUrl,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleFeedback = () => {
    navigation.navigate('Feedback');
  };

  const handlePrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const handleTermsOfService = () => {
    navigation.navigate('TermsOfService');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgGray }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t.settings.title}
        </Text>

        {/* Account Section */}
        <SectionTitle title={t.settings.account} colors={colors} />
        <Card style={styles.section}>
          <SettingsItem
            icon="👤"
            title={t.settings.profile}
            value={user?.email || 'Not signed in'}
            onPress={() => navigation.navigate('Profile')}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsItem
            icon="🔒"
            title={t.settings.changePassword}
            onPress={() => {}}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsItem
            icon="🚪"
            title={t.auth.logout}
            onPress={handleLogout}
            showArrow={false}
            colors={colors}
          />
        </Card>

        {/* Preferences Section */}
        <SectionTitle title={t.settings.preferences} colors={colors} />
        <Card style={styles.section}>
          <SettingsItem
            icon="🌙"
            title={t.settings.darkMode}
            rightComponent={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsItem
            icon="🌐"
            title={t.settings.language}
            value={LANGUAGES.find(l => l.code === language)?.nativeName || 'English'}
            onPress={handleLanguageChange}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsItem
            icon="🔔"
            title={t.settings.notifications}
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
            colors={colors}
          />
        </Card>

        {/* About Section */}
        <SectionTitle title={t.settings.about} colors={colors} />
        <Card style={styles.section}>
          <SettingsItem
            icon="ℹ️"
            title={t.settings.version}
            value="1.0.0"
            showArrow={false}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsItem
            icon="⭐"
            title={t.settings.rateApp}
            onPress={handleRateApp}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsItem
            icon="📤"
            title={language === 'ar' ? 'مشاركة التطبيق' : 'Share App'}
            onPress={handleShareApp}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsItem
            icon="💬"
            title={language === 'ar' ? 'الملاحظات والدعم' : 'Feedback & Support'}
            onPress={handleFeedback}
            colors={colors}
          />
        </Card>

        {/* Legal Section */}
        <SectionTitle title={language === 'ar' ? 'قانوني' : 'Legal'} colors={colors} />
        <Card style={styles.section}>
          <SettingsItem
            icon="🔒"
            title={t.settings.privacyPolicy}
            onPress={handlePrivacyPolicy}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingsItem
            icon="📋"
            title={t.settings.termsOfService}
            onPress={handleTermsOfService}
            colors={colors}
          />
        </Card>

        {/* Storage Section */}
        <SectionTitle title={t.settings.storage} colors={colors} />
        <Card style={styles.section}>
          <View style={styles.storageInfo}>
            <Text style={[styles.storageText, { color: colors.textPrimary }]}>
              Used: {usedMB} MB / {limitMB} MB
            </Text>
            <View style={[styles.storageBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.storageProgress,
                  { backgroundColor: colors.primary, width: `${usagePercent}%` },
                ]}
              />
            </View>
            {!isPro && (
              <Text style={[styles.upgradeHint, { color: colors.textSecondary }]}>
                Upgrade to Pro for unlimited storage
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: colors.error }]}
            onPress={handleClearCache}
          >
            <Text style={[styles.clearButtonText, { color: colors.error }]}>
              {t.settings.clearCache}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textLight }]}>
            PDF Master Pro v1.0.0
          </Text>
          <Text style={[styles.footerText, { color: colors.textLight }]}>
            Made with ❤️ for PDF lovers
          </Text>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: insets.bottom + 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    padding: 0,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  settingsIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  settingsInfo: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  settingsValue: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 52,
  },
  storageInfo: {
    padding: Spacing.md,
  },
  storageText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.sm,
  },
  storageBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  storageProgress: {
    height: '100%',
    borderRadius: 4,
  },
  upgradeHint: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  clearButton: {
    margin: Spacing.md,
    marginTop: 0,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
  },
});

export default SettingsScreen;
