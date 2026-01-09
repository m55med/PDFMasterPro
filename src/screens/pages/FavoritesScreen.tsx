// PDF Master Pro - Favorites Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useLanguage, useFavorites } from '../../context';
import { Card } from '../../components/common';
import { Typography, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import { TOOLS, Tool } from '../../constants/tools';

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const insets = useSafeAreaInsets();

  // Get favorite tools
  const favoriteTools = TOOLS.filter((tool) => favorites.includes(tool.id));

  const handleToolPress = (tool: Tool) => {
    navigation.navigate(tool.screen.replace('Screen', ''));
  };

  const getToolEmoji = (toolId: string): string => {
    const emojiMap: Record<string, string> = {
      'merge': '📎',
      'split': '✂️',
      'compress': '📦',
      'rotate': '🔄',
      'protect': '🔐',
      'unlock': '🔓',
      'watermark': '💧',
      'page-numbers': '🔢',
      'ocr': '👁️',
      'organize': '📑',
      'jpg-to-pdf': '🖼️',
      'pdf-to-jpg': '📄',
    };
    return emojiMap[toolId] || '📄';
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
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t.favorites.title}
        </Text>

        {favoriteTools.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>⭐</Text>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                {t.favorites.noFavorites}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {t.favorites.addFavorite}
              </Text>
            </View>
          </Card>
        ) : (
          <View style={styles.toolsGrid}>
            {favoriteTools.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={[styles.toolCard, { backgroundColor: colors.bgWhite }]}
                onPress={() => handleToolPress(tool)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.toolIcon,
                    { backgroundColor: `${tool.colors[0]}15` },
                  ]}
                >
                  <Text style={styles.toolEmoji}>{getToolEmoji(tool.id)}</Text>
                </View>
                <View style={styles.toolInfo}>
                  <Text style={[styles.toolName, { color: colors.textPrimary }]}>
                    {isRTL ? tool.nameAr : tool.name}
                  </Text>
                  <Text
                    style={[styles.toolDesc, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {isRTL ? tool.descriptionAr : tool.description}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => toggleFavorite(tool.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.favoriteIcon}>
                    {isFavorite(tool.id) ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.arrow, { color: colors.textLight }]}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
  emptyCard: {
    minHeight: 250,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  toolsGrid: {
    gap: Spacing.sm,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  toolEmoji: {
    fontSize: 24,
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginBottom: 2,
  },
  toolDesc: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
  },
  favoriteButton: {
    padding: Spacing.xs,
    marginRight: Spacing.xs,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  arrow: {
    fontSize: 20,
    marginLeft: Spacing.xs,
  },
});

export default FavoritesScreen;
