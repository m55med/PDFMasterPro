// PDF Master Pro - i18n Configuration
import { en, TranslationKeys } from './en';
import { ar } from './ar';

export type LanguageCode = 'en' | 'ar' | 'fr';

export const translations: Record<LanguageCode, TranslationKeys> = {
  en,
  ar,
  fr: en, // Fallback to English for now
};

export const getTranslation = (lang: LanguageCode): TranslationKeys => {
  return translations[lang] || translations.en;
};

export const isRTL = (lang: LanguageCode): boolean => {
  return lang === 'ar';
};

export { en, ar };
export type { TranslationKeys };
