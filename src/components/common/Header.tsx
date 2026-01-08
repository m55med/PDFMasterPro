// PDF Master Pro - Header Component
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context';
import { Layout, Typography, Spacing } from '../../constants/theme';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  centerTitle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBackPress,
  rightAction,
  transparent = false,
  centerTitle = false,
}) => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={transparent ? 'transparent' : colors.bgWhite}
      />
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            backgroundColor: transparent ? 'transparent' : colors.bgWhite,
            borderBottomColor: transparent ? 'transparent' : colors.border,
            borderBottomWidth: transparent ? 0 : StyleSheet.hairlineWidth,
          },
        ]}
      >
        <View style={styles.content}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {showBack && (
              <TouchableOpacity
                onPress={handleBack}
                style={styles.backButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.backText, { color: colors.primary }]}>
                  {'<'} Back
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Title */}
          {title && (
            <View style={[styles.titleContainer, centerTitle && styles.centerTitle]}>
              <Text
                style={[styles.title, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {title}
              </Text>
            </View>
          )}

          {/* Right Section */}
          <View style={styles.rightSection}>{rightAction}</View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  content: {
    height: Layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  leftSection: {
    minWidth: 60,
    alignItems: 'flex-start',
  },
  rightSection: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerTitle: {
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  backButton: {
    paddingVertical: Spacing.xs,
  },
  backText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
});

export default Header;
