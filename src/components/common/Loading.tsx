// PDF Master Pro - Loading Component
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../../context';
import { Typography, Spacing, BorderRadius } from '../../constants/theme';

interface LoadingProps {
  visible?: boolean;
  message?: string;
  overlay?: boolean;
  size?: 'small' | 'large';
}

export const Loading: React.FC<LoadingProps> = ({
  visible = true,
  message,
  overlay = false,
  size = 'large',
}) => {
  const { colors } = useTheme();

  const content = (
    <View
      style={[
        styles.container,
        overlay && styles.overlay,
        { backgroundColor: overlay ? 'rgba(0,0,0,0.5)' : 'transparent' },
      ]}
    >
      <View
        style={[
          styles.content,
          overlay && styles.overlayContent,
          overlay && { backgroundColor: colors.bgWhite },
        ]}
      >
        <ActivityIndicator size={size} color={colors.primary} />
        {message && (
          <Text style={[styles.message, { color: colors.textPrimary }]}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );

  if (!visible) return null;

  if (overlay) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        {content}
      </Modal>
    );
  }

  return content;
};

// Inline Loading Spinner
export const LoadingSpinner: React.FC<{ color?: string; size?: 'small' | 'large' }> = ({
  color,
  size = 'small',
}) => {
  const { colors } = useTheme();
  return <ActivityIndicator size={size} color={color || colors.primary} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayContent: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    minWidth: 120,
  },
  message: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
});

export default Loading;
