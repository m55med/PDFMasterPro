// PDF Master Pro - Theme Context
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, DarkColors } from '../constants/colors';
import { APP_CONFIG } from '../constants/config';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  textPrimary: string;
  textSecondary: string;
  textLight: string;
  textWhite: string;
  bgWhite: string;
  bgGray: string;
  bgLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
  border: string;
  borderLight: string;
}

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('system');

  const isDark =
    theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');

  const colors: ThemeColors = {
    primary: Colors.primary,
    primaryDark: Colors.primaryDark,
    primaryLight: Colors.primaryLight,
    secondary: Colors.secondary,
    textPrimary: isDark ? DarkColors.textPrimary : Colors.textPrimary,
    textSecondary: isDark ? DarkColors.textSecondary : Colors.textSecondary,
    textLight: isDark ? DarkColors.textLight : Colors.textLight,
    textWhite: Colors.textWhite,
    bgWhite: isDark ? DarkColors.bgWhite : Colors.bgWhite,
    bgGray: isDark ? DarkColors.bgGray : Colors.bgGray,
    bgLight: isDark ? DarkColors.bgLight : Colors.bgLight,
    success: Colors.success,
    successLight: Colors.successLight,
    warning: Colors.warning,
    warningLight: Colors.warningLight,
    error: Colors.error,
    errorLight: Colors.errorLight,
    info: Colors.info,
    infoLight: Colors.infoLight,
    border: isDark ? DarkColors.border : Colors.border,
    borderLight: isDark ? DarkColors.borderLight : Colors.borderLight,
  };

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(APP_CONFIG.storageKeys.theme);
      if (savedTheme) {
        setThemeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      await AsyncStorage.setItem(APP_CONFIG.storageKeys.theme, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    isDark,
    colors,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
