// PDF Master Pro - Tools Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useLanguage } from '../../context';
import { Card } from '../../components/common';
import { Typography, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import { TOOLS, TOOL_CATEGORIES, Tool, ToolCategory } from '../../constants/tools';

const { width } = Dimensions.get('window');

const ToolsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');

  const filteredTools = TOOLS.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.bgWhite,
            paddingTop: insets.top + Spacing.md,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {t.tools.allTools}
        </Text>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.bgGray, borderColor: colors.border },
          ]}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[
              styles.searchInput,
              { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
            ]}
            placeholder={t.tools.search}
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {TOOL_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.bgGray,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(category.id as ToolCategory | 'all')}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {isRTL ? category.nameAr : category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Tools List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.toolsGrid}>
          {filteredTools.map((tool) => (
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
              <Text style={[styles.arrow, { color: colors.textLight }]}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredTools.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No tools found
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textLight }]}>
              Try a different search term
            </Text>
          </View>
        )}

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
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    ...Shadow.sm,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 16,
    opacity: 0.5,
    padding: Spacing.xs,
  },
  categories: {
    paddingRight: Spacing.md,
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  scrollContent: {
    padding: Spacing.md,
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
  arrow: {
    fontSize: 20,
    marginLeft: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
  },
});

export default ToolsScreen;
