// PDF Master Pro - App Configuration

export const APP_CONFIG = {
  name: 'PDF Master Pro',
  version: '1.0.0',
  description: 'Complete PDF toolkit for mobile',

  // Storage Keys
  storageKeys: {
    theme: '@pdfmaster/theme',
    language: '@pdfmaster/language',
    recentFiles: '@pdfmaster/recent_files',
    favorites: '@pdfmaster/favorites',
    settings: '@pdfmaster/settings',
    authUser: '@pdfmaster/auth_user',
  },

  // Limits
  limits: {
    maxFileSize: 50 * 1024 * 1024, // 50 MB
    maxFiles: 20,
    recentFilesLimit: 10,
  },

  // Supported formats
  supportedFormats: {
    pdf: ['application/pdf'],
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },

  // API (for future use)
  api: {
    baseUrl: '',
    timeout: 30000,
  },

  // Feature Flags
  features: {
    darkMode: true,
    multiLanguage: true,
    googleSignIn: true,
    appleSignIn: true,
    analytics: false,
  },
};

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false },
];

export const DEFAULT_LANGUAGE = 'en';
export const DEFAULT_THEME = 'light';
