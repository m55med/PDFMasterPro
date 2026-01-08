// PDF Master Pro - Colors
// Design System Colors

export const Colors = {
  // Primary
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',

  // Secondary
  secondary: '#6366F1',
  secondaryDark: '#4F46E5',
  secondaryLight: '#EEF2FF',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textWhite: '#FFFFFF',

  // Background
  bgWhite: '#FFFFFF',
  bgGray: '#F9FAFB',
  bgLight: '#F3F4F6',

  // Status
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Border
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Tool Colors (Gradients)
  toolMerge: ['#3B82F6', '#2563EB'] as const,
  toolSplit: ['#8B5CF6', '#7C3AED'] as const,
  toolCompress: ['#10B981', '#059669'] as const,
  toolConvert: ['#F59E0B', '#D97706'] as const,
  toolProtect: ['#EF4444', '#DC2626'] as const,
  toolUnlock: ['#F97316', '#EA580C'] as const,
  toolRotate: ['#EC4899', '#DB2777'] as const,
  toolWatermark: ['#06B6D4', '#0891B2'] as const,
  toolPageNumbers: ['#8B5CF6', '#6D28D9'] as const,
  toolOCR: ['#14B8A6', '#0D9488'] as const,
  toolOrganize: ['#6366F1', '#4F46E5'] as const,
  toolJpgToPdf: ['#F59E0B', '#D97706'] as const,
  toolPdfToJpg: ['#F97316', '#EA580C'] as const,

  // Transparent
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Dark Mode Colors
export const DarkColors = {
  bgWhite: '#1F2937',
  bgGray: '#111827',
  bgLight: '#374151',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textLight: '#6B7280',
  border: '#374151',
  borderLight: '#4B5563',
};

export type ColorType = keyof typeof Colors;
