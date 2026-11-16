/**
 * Main Theme Configuration
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  
  // Animation
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  
  // Layout
  layout: {
    containerPadding: spacing.base,
    screenPadding: spacing.base,
    maxWidth: 1200,
  },
  
  // Icons
  iconSizes: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  
  // Buttons
  button: {
    height: {
      sm: 32,
      md: 44,
      lg: 52,
    },
    minWidth: 100,
    borderRadius: borderRadius.lg,
  },
  
  // Input
  input: {
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  
  // Card
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.base,
  },
} as const;

export type Theme = typeof theme;
