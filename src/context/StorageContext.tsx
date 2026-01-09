// PDF Master Pro - Storage Context
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import RNFS from 'react-native-fs';
import { StorageInfo, PLAN_CONFIG } from '../types/subscription';
import { useSubscription } from './SubscriptionContext';

interface StorageContextType {
  storageInfo: StorageInfo;
  isLoading: boolean;
  refreshStorage: () => Promise<void>;
  canSaveFile: (fileSizeBytes: number) => boolean;
  getAvailableSpace: () => number;
  formatBytes: (bytes: number) => string;
  deleteFile: (filePath: string) => Promise<boolean>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

interface StorageProviderProps {
  children: ReactNode;
}

// App documents directory for storing PDFs
const APP_DOCUMENTS_DIR = `${RNFS.DocumentDirectoryPath}/PDFMasterPro`;

export const StorageProvider: React.FC<StorageProviderProps> = ({ children }) => {
  const { isPro, storageLimit } = useSubscription();
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    usedBytes: 0,
    limitBytes: PLAN_CONFIG.free.storageLimitBytes,
    isLimitReached: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Calculate total size of files in app directory
  const calculateUsedStorage = useCallback(async (): Promise<number> => {
    try {
      // Ensure directory exists
      const dirExists = await RNFS.exists(APP_DOCUMENTS_DIR);
      if (!dirExists) {
        await RNFS.mkdir(APP_DOCUMENTS_DIR);
        return 0;
      }

      // Get all files recursively
      const files = await RNFS.readDir(APP_DOCUMENTS_DIR);
      let totalSize = 0;

      for (const file of files) {
        if (file.isFile()) {
          totalSize += file.size;
        } else if (file.isDirectory()) {
          // Recursively calculate subdirectory size
          totalSize += await calculateDirectorySize(file.path);
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error calculating storage:', error);
      return 0;
    }
  }, []);

  // Helper to calculate directory size recursively
  const calculateDirectorySize = async (dirPath: string): Promise<number> => {
    try {
      const files = await RNFS.readDir(dirPath);
      let size = 0;

      for (const file of files) {
        if (file.isFile()) {
          size += file.size;
        } else if (file.isDirectory()) {
          size += await calculateDirectorySize(file.path);
        }
      }

      return size;
    } catch (error) {
      console.error('Error calculating directory size:', error);
      return 0;
    }
  };

  // Refresh storage info
  const refreshStorage = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const usedBytes = await calculateUsedStorage();
      const limitBytes = isPro ? -1 : PLAN_CONFIG.free.storageLimitBytes;
      const isLimitReached = !isPro && usedBytes >= limitBytes;

      setStorageInfo({
        usedBytes,
        limitBytes,
        isLimitReached,
      });
    } catch (error) {
      console.error('Error refreshing storage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isPro, calculateUsedStorage]);

  // Check if a file can be saved
  const canSaveFile = useCallback(
    (fileSizeBytes: number): boolean => {
      // Pro users have unlimited storage
      if (isPro) return true;

      const newTotal = storageInfo.usedBytes + fileSizeBytes;
      return newTotal <= PLAN_CONFIG.free.storageLimitBytes;
    },
    [isPro, storageInfo.usedBytes]
  );

  // Get available space in bytes
  const getAvailableSpace = useCallback((): number => {
    // Pro users have unlimited storage
    if (isPro) return -1;

    const available = PLAN_CONFIG.free.storageLimitBytes - storageInfo.usedBytes;
    return Math.max(0, available);
  }, [isPro, storageInfo.usedBytes]);

  // Format bytes to human-readable string
  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === -1) return 'Unlimited';
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Delete a file and refresh storage
  const deleteFile = useCallback(
    async (filePath: string): Promise<boolean> => {
      try {
        const exists = await RNFS.exists(filePath);
        if (exists) {
          await RNFS.unlink(filePath);
          await refreshStorage();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error deleting file:', error);
        return false;
      }
    },
    [refreshStorage]
  );

  // Initial load and refresh when isPro changes
  useEffect(() => {
    refreshStorage();
  }, [refreshStorage]);

  const value: StorageContextType = {
    storageInfo,
    isLoading,
    refreshStorage,
    canSaveFile,
    getAvailableSpace,
    formatBytes,
    deleteFile,
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = (): StorageContextType => {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
};

// Export the app documents directory path for use in other parts of the app
export const getAppDocumentsDir = (): string => APP_DOCUMENTS_DIR;

export default StorageContext;
