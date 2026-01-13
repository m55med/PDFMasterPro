// PDF Master Pro - Context Providers
import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import { SubscriptionProvider } from './SubscriptionContext';
import { FavoritesProvider } from './FavoritesContext';
import { StorageProvider } from './StorageContext';
import { AdProvider } from './AdContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <AdProvider>
              <FavoritesProvider>
                <StorageProvider>
                  {children}
                </StorageProvider>
              </FavoritesProvider>
            </AdProvider>
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
export { StorageProvider, useStorage } from './StorageContext';
export { AdProvider, useAds } from './AdContext';
