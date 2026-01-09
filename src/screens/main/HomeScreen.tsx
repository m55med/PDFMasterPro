// PDF Master Pro - Home Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useLanguage, useAuth } from '../../context';
import { Card } from '../../components/common';
import { Typography, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import { TOOLS } from '../../constants/tools';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const quickTools = TOOLS.slice(0, 4); // First 4 tools for quick actions

  const handleToolPress = (toolId: string, screen: string) => {
    navigation.navigate('Tools', { screen });
  };

  const handleUpload = () => {
    // TODO: Implement file picker
    console.log('Open file picker');
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
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {t.home.welcomeBack}
            </Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {t.common.appName}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.avatar, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '👤'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Upload Card */}
        <Card style={styles.uploadCard} onPress={handleUpload}>
          <View style={styles.uploadContent}>
            <View
              style={[
                styles.uploadIconContainer,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Text style={styles.uploadIcon}>📤</Text>
            </View>
            <View style={styles.uploadTextContainer}>
              <Text style={[styles.uploadTitle, { color: colors.textPrimary }]}>
                {t.home.quickUpload}
              </Text>
              <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
                {t.home.tapToSelect}
              </Text>
            </View>
            <Text style={styles.uploadArrow}>→</Text>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t.home.quickActions}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tools')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                {t.home.seeAll}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActions}>
            {quickTools.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={[styles.quickAction, { backgroundColor: colors.bgWhite }]}
                onPress={() => handleToolPress(tool.id, tool.screen)}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: `${tool.colors[0]}15` },
                  ]}
                >
                  <Text style={styles.quickActionEmoji}>
                    {tool.id === 'merge' ? '📎' :
                     tool.id === 'split' ? '✂️' :
                     tool.id === 'compress' ? '📦' :
                     tool.id === 'jpg-to-pdf' ? '🔄' : '📄'}
                  </Text>
                </View>
                <Text
                  style={[styles.quickActionText, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {tool.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Files */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t.home.recentFiles}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Documents')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                {t.home.viewAll}
              </Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.recentFilesCard}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📁</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t.home.noRecentFiles}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textLight }]}>
                Your recently processed files will appear here
              </Text>
            </View>
          </Card>
        </View>

        {/* All Tools Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t.tools.allTools}
          </Text>

          <View style={styles.toolsGrid}>
            {TOOLS.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={[styles.toolCard, { backgroundColor: colors.bgWhite }]}
                onPress={() => handleToolPress(tool.id, tool.screen)}
              >
                <View
                  style={[
                    styles.toolIcon,
                    { backgroundColor: `${tool.colors[0]}15` },
                  ]}
                >
                  <Text style={styles.toolEmoji}>
                    {tool.id === 'merge' ? '📎' :
                     tool.id === 'split' ? '✂️' :
                     tool.id === 'compress' ? '📦' :
                     tool.id === 'rotate' ? '🔄' :
                     tool.id === 'protect' ? '🔐' :
                     tool.id === 'unlock' ? '🔓' :
                     tool.id === 'watermark' ? '💧' :
                     tool.id === 'page-numbers' ? '🔢' :
                     tool.id === 'ocr' ? '👁️' :
                     tool.id === 'organize' ? '📑' :
                     tool.id === 'jpg-to-pdf' ? '🖼️' :
                     tool.id === 'pdf-to-jpg' ? '📄' : '📄'}
                  </Text>
                </View>
                <Text
                  style={[styles.toolName, { color: colors.textPrimary }]}
                  numberOfLines={1}
                >
                  {tool.name}
                </Text>
                <Text
                  style={[styles.toolDesc, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {tool.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: insets.bottom + 80 }} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.fontSize.sm,
    marginBottom: 2,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  uploadCard: {
    marginBottom: Spacing.lg,
  },
  uploadContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  uploadIcon: {
    fontSize: 24,
  },
  uploadTextContainer: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: 2,
  },
  uploadSubtitle: {
    fontSize: Typography.fontSize.sm,
  },
  uploadArrow: {
    fontSize: 20,
    opacity: 0.5,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
  },
  seeAll: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
  recentFilesCard: {
    minHeight: 120,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  toolCard: {
    width: (width - Spacing.md * 2 - Spacing.sm * 2) / 3,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadow.sm,
  },
  toolIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  toolEmoji: {
    fontSize: 20,
  },
  toolName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    textAlign: 'center',
    marginBottom: 2,
  },
  toolDesc: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default HomeScreen;
