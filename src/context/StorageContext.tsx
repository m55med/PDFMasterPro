// PDF Master Pro - Storage Context
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageInfo, PLAN_CONFIG } from '../types/subscription';
import { useSubscription } from './SubscriptionContext';
import { PDFFile } from '../types/pdf';

const DOCUMENTS_STORAGE_KEY = '@pdf_master_documents';

interface StorageContextType {
  storageInfo: StorageInfo;
  isLoading: boolean;
  refreshStorage: () => Promise<void>;
  canSaveFile: (fileSizeBytes: number) => boolean;
  getAvailableSpace: () => number;
  formatBytes: (bytes: number) => string;
  deleteFile: (filePath: string) => Promise<boolean>;
  // Document management
  documents: PDFFile[];
  addDocument: (doc: PDFFile) => Promise<void>;
  removeDocument: (docId: string) => Promise<void>;
  loadDocuments: () => Promise<void>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

interface StorageProviderProps {
  children: ReactNode;
}

export const StorageProvider: React.FC<StorageProviderProps> = ({ children }) => {
  const { isPro } = useSubscription();
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    usedBytes: 0,
    totalBytes: isPro ? -1 : PLAN_CONFIG.free.storageLimitBytes,
    usagePercentage: 0,
    isLimitReached: false,
  });
  const [isLoading] = useState(false);
  const [documents, setDocuments] = useState<PDFFile[]>([]);

  // Load documents from AsyncStorage
  const loadDocuments = useCallback(async (): Promise<void> => {
    try {
      const stored = await AsyncStorage.getItem(DOCUMENTS_STORAGE_KEY);
      if (stored) {
        const parsedDocs = JSON.parse(stored) as PDFFile[];
        setDocuments(parsedDocs);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  }, []);

  // Add a document
  const addDocument = useCallback(async (doc: PDFFile): Promise<void> => {
    try {
      const newDocs = [...documents, doc];
      await AsyncStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(newDocs));
      setDocuments(newDocs);
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }, [documents]);

  // Remove a document
  const removeDocument = useCallback(async (docId: string): Promise<void> => {
    try {
      const newDocs = documents.filter(d => d.id !== docId);
      await AsyncStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(newDocs));
      setDocuments(newDocs);
    } catch (error) {
      console.error('Error removing document:', error);
      throw error;
    }
  }, [documents]);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh storage info - simplified without RNFS
  const refreshStorage = useCallback(async (): Promise<void> => {
    const limitBytes = isPro ? -1 : PLAN_CONFIG.free.storageLimitBytes;
    setStorageInfo({
      usedBytes: 0,
      totalBytes: limitBytes,
      usagePercentage: 0,
      isLimitReached: false,
    });
  }, [isPro]);

  // Check if a file can be saved
  const canSaveFile = useCallback(
    (fileSizeBytes: number): boolean => {
      if (isPro) return true;
      const newTotal = storageInfo.usedBytes + fileSizeBytes;
      return newTotal <= PLAN_CONFIG.free.storageLimitBytes;
    },
    [isPro, storageInfo.usedBytes]
  );

  // Get available space in bytes
  const getAvailableSpace = useCallback((): number => {
    if (isPro) return -1;
    const available = PLAN_CONFIG.free.storageLimitBytes - storageInfo.usedBytes;
    return Math.max(0, available);
  }, [isPro, storageInfo.usedBytes]);

  // Format bytes to human-readable string
  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === -1) return 'غير محدود';
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Delete a file - not available without RNFS
  const deleteFile = useCallback(
    async (_filePath: string): Promise<boolean> => {
      console.warn('Delete file not available without RNFS');
      return false;
    },
    []
  );

  const value: StorageContextType = {
    storageInfo,
    isLoading,
    refreshStorage,
    canSaveFile,
    getAvailableSpace,
    formatBytes,
    deleteFile,
    // Document management
    documents,
    addDocument,
    removeDocument,
    loadDocuments,
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

export default StorageContext;
