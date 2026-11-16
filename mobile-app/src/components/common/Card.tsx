/**
 * Card Component
 * Container with shadow and rounded corners
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof theme.spacing;
  style?: ViewStyle;
}

export function Card({
  children,
  onPress,
  variant = 'default',
  padding = 'base',
  style,
}: CardProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.card,
        styles[`${variant}Card`],
        { padding: theme.spacing[padding] },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.card.borderRadius,
  },
  defaultCard: {
    ...theme.shadows.sm,
  },
  elevatedCard: {
    ...theme.shadows.md,
  },
  outlinedCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
