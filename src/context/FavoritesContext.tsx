// PDF Master Pro - Favorites Context
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@pdf_master_favorites';

interface FavoritesContextType {
  favorites: string[]; // Array of tool IDs
  isLoading: boolean;
  isFavorite: (toolId: string) => boolean;
  toggleFavorite: (toolId: string) => Promise<void>;
  addFavorite: (toolId: string) => Promise<void>;
  removeFavorite: (toolId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavorites = async (newFavorites: string[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const isFavorite = useCallback((toolId: string): boolean => {
    return favorites.includes(toolId);
  }, [favorites]);

  const addFavorite = async (toolId: string): Promise<void> => {
    if (!favorites.includes(toolId)) {
      await saveFavorites([...favorites, toolId]);
    }
  };

  const removeFavorite = async (toolId: string): Promise<void> => {
    await saveFavorites(favorites.filter(id => id !== toolId));
  };

  const toggleFavorite = async (toolId: string): Promise<void> => {
    if (isFavorite(toolId)) {
      await removeFavorite(toolId);
    } else {
      await addFavorite(toolId);
    }
  };

  const value: FavoritesContextType = {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export default FavoritesContext;
