// PDF Master Pro - Card Component
import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context';
import { BorderRadius, Spacing, Shadow } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'elevated',
  padding = 'md',
}) => {
  const { colors } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.lg,
      padding: padding === 'none' ? 0 : Spacing[padding],
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: colors.bgWhite,
          ...Shadow.md,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: colors.bgWhite,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: colors.bgGray,
        };
      default:
        return baseStyle;
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[getCardStyle(), style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({});

export default Card;
