// PDF Master Pro - Privacy Policy Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useLanguage } from '../../context';
import { Header } from '../../components/common';
import { Typography, Spacing } from '../../constants/theme';

const PrivacyPolicyScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();

  const Section: React.FC<{ title: string; content: string }> = ({ title, content }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
      <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
        {content}
      </Text>
    </View>
  );

  const BulletPoint: React.FC<{ text: string }> = ({ text }) => (
    <View style={styles.bulletPoint}>
      <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
      <Text style={[styles.bulletText, { color: colors.textSecondary }]}>
        {text}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgWhite }]}>
      <Header showBack title={t.legal.privacyPolicy} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Last Updated */}
        <Text style={[styles.lastUpdated, { color: colors.textLight }]}>
          {t.legal.lastUpdated}: January 1, 2025
        </Text>

        {/* Introduction */}
        <Text style={[styles.introduction, { color: colors.textSecondary }]}>
          {t.legal.privacyIntro}
        </Text>

        {/* Sections */}
        <Section
          title={t.legal.infoCollectTitle}
          content={t.legal.infoCollectContent}
        />

        <View style={styles.bulletList}>
          <BulletPoint text={t.legal.infoCollect1} />
          <BulletPoint text={t.legal.infoCollect2} />
          <BulletPoint text={t.legal.infoCollect3} />
          <BulletPoint text={t.legal.infoCollect4} />
        </View>

        <Section
          title={t.legal.howWeUseTitle}
          content={t.legal.howWeUseContent}
        />

        <View style={styles.bulletList}>
          <BulletPoint text={t.legal.howWeUse1} />
          <BulletPoint text={t.legal.howWeUse2} />
          <BulletPoint text={t.legal.howWeUse3} />
          <BulletPoint text={t.legal.howWeUse4} />
        </View>

        <Section
          title={t.legal.dataSharingTitle}
          content={t.legal.dataSharingContent}
        />

        <Section
          title={t.legal.dataSecurityTitle}
          content={t.legal.dataSecurityContent}
        />

        <Section
          title={t.legal.dataRetentionTitle}
          content={t.legal.dataRetentionContent}
        />

        <Section
          title={t.legal.yourRightsTitle}
          content={t.legal.yourRightsContent}
        />

        <View style={styles.bulletList}>
          <BulletPoint text={t.legal.yourRights1} />
          <BulletPoint text={t.legal.yourRights2} />
          <BulletPoint text={t.legal.yourRights3} />
          <BulletPoint text={t.legal.yourRights4} />
        </View>

        <Section
          title={t.legal.cookiesTitle}
          content={t.legal.cookiesContent}
        />

        <Section
          title={t.legal.childrenTitle}
          content={t.legal.childrenContent}
        />

        <Section
          title={t.legal.changesPrivacyTitle}
          content={t.legal.changesPrivacyContent}
        />

        <Section
          title={t.legal.contactPrivacyTitle}
          content={t.legal.contactPrivacyContent}
        />

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.textLight }]}>
            PDF Master Pro
          </Text>
          <Text style={[styles.footerText, { color: colors.textLight }]}>
            {t.legal.allRightsReserved}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  lastUpdated: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
  introduction: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.sm,
  },
  sectionContent: {
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
  },
  bulletList: {
    marginBottom: Spacing.lg,
    marginLeft: Spacing.sm,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  bullet: {
    fontSize: Typography.fontSize.base,
    marginRight: Spacing.sm,
    lineHeight: 24,
  },
  bulletText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    lineHeight: 24,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
});

export default PrivacyPolicyScreen;
