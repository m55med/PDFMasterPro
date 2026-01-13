// PDF Master Pro - Terms of Service Screen
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

interface SectionProps {
  title: string;
  content: string;
  colors: { textPrimary: string; textSecondary: string };
}

const Section: React.FC<SectionProps> = ({ title, content, colors }) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
      {title}
    </Text>
    <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
      {content}
    </Text>
  </View>
);

const TermsOfServiceScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.bgWhite }]}>
      <Header showBack title={t.legal.termsOfService} />

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
          {t.legal.termsIntro}
        </Text>

        {/* Sections */}
        <Section
          title={t.legal.acceptanceTitle}
          content={t.legal.acceptanceContent}
          colors={colors}
        />

        <Section
          title={t.legal.useOfServiceTitle}
          content={t.legal.useOfServiceContent}
          colors={colors}
        />

        <Section
          title={t.legal.userAccountsTitle}
          content={t.legal.userAccountsContent}
          colors={colors}
        />

        <Section
          title={t.legal.intellectualPropertyTitle}
          content={t.legal.intellectualPropertyContent}
          colors={colors}
        />

        <Section
          title={t.legal.userContentTitle}
          content={t.legal.userContentContent}
          colors={colors}
        />

        <Section
          title={t.legal.prohibitedUsesTitle}
          content={t.legal.prohibitedUsesContent}
          colors={colors}
        />

        <Section
          title={t.legal.disclaimerTitle}
          content={t.legal.disclaimerContent}
          colors={colors}
        />

        <Section
          title={t.legal.limitationTitle}
          content={t.legal.limitationContent}
          colors={colors}
        />

        <Section
          title={t.legal.terminationTitle}
          content={t.legal.terminationContent}
          colors={colors}
        />

        <Section
          title={t.legal.changesTitle}
          content={t.legal.changesContent}
          colors={colors}
        />

        <Section
          title={t.legal.contactTitle}
          content={t.legal.contactContent}
          colors={colors}
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
    marginBottom: Spacing.lg,
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

export default TermsOfServiceScreen;
