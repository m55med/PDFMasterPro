/**
 * Tool Card Component
 * Card displaying a PDF tool with icon and description
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { theme } from '../../theme';

export interface Tool {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'create' | 'edit' | 'security' | 'convert' | 'advanced';
  isPremium?: boolean;
}

interface ToolCardProps {
  tool: Tool;
  onPress: () => void;
}

export function ToolCard({ tool, onPress }: ToolCardProps) {
  const categoryColor = theme.colors.tools[tool.category];

  return (
    <Card onPress={onPress} variant="elevated" style={styles.card}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: categoryColor + '15' }]}>
          <Text style={styles.emoji}>{tool.emoji}</Text>
        </View>
        
        <View style={styles.textContainer}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {tool.name}
            </Text>
            {tool.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PRO</Text>
              </View>
            )}
          </View>
          <Text style={styles.description} numberOfLines={2}>
            {tool.description}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  emoji: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  name: {
    ...theme.typography.bodySemibold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  description: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  premiumBadge: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  premiumText: {
    ...theme.typography.small,
    color: '#fff',
    fontWeight: '700',
  },
});
