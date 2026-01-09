// PDF Master Pro - Profile Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { useTheme, useLanguage, useAuth, useSubscription, useStorage } from '../../context';
import { Card } from '../../components/common';
import { Typography, Spacing, BorderRadius, Shadow } from '../../constants/theme';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user, logout, refreshUser } = useAuth();
  const { isPro, subscription, userProfile } = useSubscription();
  const { storageInfo, formatBytes } = useStorage();
  const insets = useSafeAreaInsets();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert(t.common.error, t.auth.nameRequired || 'Name is required');
      return;
    }

    setIsSaving(true);
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await currentUser.updateProfile({
          displayName: displayName.trim(),
        });
        // Refresh user in context to update UI everywhere
        await refreshUser();
      }
      setIsEditing(false);
      Alert.alert(t.common.success, t.profile?.updateSuccess || 'Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert(t.common.error, error.message || t.profile?.updateFailed || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t.auth.logout,
      t.profile?.logoutConfirm || 'Are you sure you want to logout?',
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

  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || '?';
  };

  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : new Date().toLocaleDateString();

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
          <Text style={styles.headerTitle}>{t.settings.profile}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.editText}>
                {isEditing ? t.common.save : (t.profile?.edit || 'Edit')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: colors.bgWhite }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {getInitials()}
            </Text>
          </View>
          {isEditing && (
            <TouchableOpacity style={[styles.changePhotoButton, { backgroundColor: colors.bgWhite }]}>
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Name */}
        {isEditing ? (
          <TextInput
            style={[styles.nameInput, { borderColor: 'rgba(255,255,255,0.5)' }]}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={t.profile?.enterName || 'Enter your name'}
            placeholderTextColor="rgba(255,255,255,0.6)"
          />
        ) : (
          <Text style={styles.name}>
            {user?.displayName || t.profile?.noName || 'No name set'}
          </Text>
        )}
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Info Card */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {t.profile?.accountInfo || 'Account Information'}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📧</Text>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t.auth.email}
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {user?.email}
              </Text>
            </View>
            {user?.emailVerified && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.verifiedText, { color: colors.success }]}>
                  ✓ {t.profile?.verified || 'Verified'}
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t.profile?.memberSince || 'Member Since'}
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {memberSince}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>{isPro ? '⭐' : '🔐'}</Text>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t.profile?.accountType || 'Account Type'}
              </Text>
              <Text style={[styles.infoValue, { color: isPro ? colors.primary : colors.textPrimary }]}>
                {isPro
                  ? (t.profile?.proAccount || 'Pro Account')
                  : (t.profile?.freeAccount || 'Free Account')}
              </Text>
            </View>
            {!isPro && (
              <TouchableOpacity
                style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Subscription')}
              >
                <Text style={styles.upgradeText}>
                  {t.profile?.upgrade || 'Upgrade'}
                </Text>
              </TouchableOpacity>
            )}
            {isPro && (
              <View style={[styles.proBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.proBadgeText, { color: colors.primary }]}>PRO</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Storage Card */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {t.profile?.storage || 'Storage'}
          </Text>

          <View style={styles.storageInfo}>
            <View style={styles.storageHeader}>
              <Text style={[styles.storageLabel, { color: colors.textSecondary }]}>
                {t.profile?.localStorage || 'Local Storage'}
              </Text>
              <Text style={[styles.storageValue, { color: colors.textPrimary }]}>
                {formatBytes(storageInfo.usedBytes)} / {isPro ? (t.subscription?.unlimited || 'Unlimited') : formatBytes(storageInfo.limitBytes)}
              </Text>
            </View>
            {!isPro && (
              <>
                <View style={[styles.storageBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.storageBarFill,
                      {
                        backgroundColor: storageInfo.isLimitReached ? colors.error : colors.primary,
                        width: `${Math.min((storageInfo.usedBytes / storageInfo.limitBytes) * 100, 100)}%`,
                      },
                    ]}
                  />
                </View>
                {storageInfo.isLimitReached && (
                  <Text style={[styles.storageLimitText, { color: colors.error }]}>
                    {t.profile?.storageFull || 'Storage full. Delete files or upgrade to Pro.'}
                  </Text>
                )}
              </>
            )}
            {isPro && (
              <Text style={[styles.storageUnlimited, { color: colors.success }]}>
                ✓ {t.profile?.unlimitedStorage || 'Unlimited storage with Pro'}
              </Text>
            )}
          </View>
        </Card>

        {/* Stats Card */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {t.profile?.statistics || 'Statistics'}
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t.profile?.filesProcessed || 'Files Processed'}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t.profile?.favorites || 'Favorites'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Actions Card */}
        <Card style={styles.card}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Settings' })}
          >
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>
              {t.settings.title}
            </Text>
            <Text style={[styles.arrowIcon, { color: colors.textLight }]}>
              {isRTL ? '←' : '→'}
            </Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionIcon}>🔒</Text>
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>
              {t.settings.changePassword}
            </Text>
            <Text style={[styles.arrowIcon, { color: colors.textLight }]}>
              {isRTL ? '←' : '→'}
            </Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.actionRow}>
            <Text style={styles.actionIcon}>📧</Text>
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>
              {t.settings.contactSupport}
            </Text>
            <Text style={[styles.arrowIcon, { color: colors.textLight }]}>
              {isRTL ? '←' : '→'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: colors.error }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={[styles.logoutText, { color: colors.error }]}>
            {t.auth.logout}
          </Text>
        </TouchableOpacity>

        {/* Bottom Padding */}
        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </View>
  );
};

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
  editButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    minWidth: 60,
    alignItems: 'center',
  },
  editText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.lg,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: Typography.fontWeight.bold,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.sm,
  },
  cameraIcon: {
    fontSize: 16,
  },
  nameInput: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    borderBottomWidth: 1,
    paddingBottom: Spacing.xs,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xs,
  },
  name: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  email: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  scrollContent: {
    padding: Spacing.md,
    marginTop: -Spacing.md,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: Typography.fontSize.xs,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  verifiedBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  verifiedText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  upgradeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  upgradeText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  statNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 40,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  actionText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  arrowIcon: {
    fontSize: 18,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  logoutText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
  proBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  proBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  storageInfo: {
    gap: Spacing.sm,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storageLabel: {
    fontSize: Typography.fontSize.sm,
  },
  storageValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  storageBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  storageBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  storageLimitText: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
  storageUnlimited: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});

export default ProfileScreen;
