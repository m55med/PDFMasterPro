// PDF Master Pro - Context Providers
import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import { SubscriptionProvider } from './SubscriptionContext';
import { FavoritesProvider } from './FavoritesContext';
// TODO: Re-enable StorageProvider once react-native-fs pods are installed
// import { StorageProvider } from './StorageContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <FavoritesProvider>
              {/* TODO: Re-enable StorageProvider once react-native-fs pods are installed */}
              {/* <StorageProvider> */}
                {children}
              {/* </StorageProvider> */}
            </FavoritesProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export { AuthProvider, useAuth } from './AuthContext';
export { ThemeProvider, useTheme } from './ThemeContext';
export { LanguageProvider, useLanguage } from './LanguageContext';
export { SubscriptionProvider, useSubscription } from './SubscriptionContext';
export { FavoritesProvider, useFavorites } from './FavoritesContext';
// TODO: Re-enable once react-native-fs pods are installed
// export { StorageProvider, useStorage, getAppDocumentsDir } from './StorageContext';

// Temporary mock exports for StorageContext
export const StorageProvider: React.FC<{ children: ReactNode }> = ({ children }) => <>{children}</>;
export const useStorage = () => ({
  storageInfo: { usedBytes: 0, limitBytes: 20 * 1024 * 1024, isLimitReached: false },
  isLoading: false,
  refreshStorage: async () => {},
  canSaveFile: () => true,
  getAvailableSpace: () => 20 * 1024 * 1024,
  formatBytes: (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`,
  deleteFile: async () => true,
});
export const getAppDocumentsDir = () => '';
