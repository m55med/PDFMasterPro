// PDF Master Pro - Language Context
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG, LANGUAGES, DEFAULT_LANGUAGE } from '../constants/config';
import { getTranslation, isRTL, TranslationKeys, LanguageCode } from '../i18n';

interface LanguageContextType {
  language: LanguageCode;
  t: TranslationKeys;
  isRTL: boolean;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  languages: typeof LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE as LanguageCode);
  const [t, setTranslations] = useState<TranslationKeys>(getTranslation(DEFAULT_LANGUAGE as LanguageCode));

  const rtl = isRTL(language);

  useEffect(() => {
    loadLanguage();
  }, []);

  useEffect(() => {
    setTranslations(getTranslation(language));

    // Update RTL setting
    if (I18nManager.isRTL !== rtl) {
      I18nManager.allowRTL(rtl);
      I18nManager.forceRTL(rtl);
      // Note: App needs to restart for RTL changes to take effect
    }
  }, [language, rtl]);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(APP_CONFIG.storageKeys.language);
      if (savedLanguage) {
        setLanguageState(savedLanguage as LanguageCode);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: LanguageCode): Promise<void> => {
    try {
      await AsyncStorage.setItem(APP_CONFIG.storageKeys.language, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const value: LanguageContextType = {
    language,
    t,
    isRTL: rtl,
    setLanguage,
    languages: LANGUAGES,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
