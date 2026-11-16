/**
 * Color Palette for PDF Master Pro
 * Inspired by modern design systems
 */

export const colors = {
  // Primary Colors
  primary: '#2563EB',      // Blue
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  
  // Secondary Colors
  secondary: '#8B5CF6',    // Purple
  secondaryDark: '#7C3AED',
  secondaryLight: '#F5F3FF',
  
  // Status Colors
  success: '#10B981',      // Green
  successLight: '#ECFDF5',
  warning: '#F59E0B',      // Amber
  warningLight: '#FFFBEB',
  error: '#EF4444',        // Red
  errorLight: '#FEF2F2',
  info: '#3B82F6',
  infoLight: '#EFF6FF',
  
  // Background Colors
  background: {
    light: '#F9FAFB',
    dark: '#0F172A',
  },
  
  // Text Colors
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    light: '#94A3B8',
    disabled: '#CBD5E1',
    inverse: '#FFFFFF',
  },
  
  // UI Elements
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  card: '#FFFFFF',
  cardDark: '#1E293B',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  
  // Tool Categories
  tools: {
    create: '#3B82F6',     // Blue
    edit: '#8B5CF6',       // Purple
    security: '#EF4444',   // Red
    convert: '#10B981',    // Green
    advanced: '#F59E0B',   // Amber
  },
  
  // Gradients
  gradients: {
    primary: ['#2563EB', '#1D4ED8'],
    secondary: ['#8B5CF6', '#7C3AED'],
    success: ['#10B981', '#059669'],
    sunset: ['#F59E0B', '#EF4444'],
    ocean: ['#3B82F6', '#2563EB'],
  },
} as const;

export type ColorKey = keyof typeof colors;
