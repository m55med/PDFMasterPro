// PDF Master Pro - PDF File Service
import { pick, types, isCancel, keepLocalCopy } from '@react-native-documents/picker';
import { PDFFile } from '../types/pdf';

// Check if storage features are available - disabled for now due to RNFS issues
export const isRNFSAvailable = (): boolean => {
  return false;
};

// Pick PDF files from device
export const pickPDFFiles = async (allowMultiple: boolean = true): Promise<PDFFile[]> => {
  try {
    const results = await pick({
      type: [types.pdf],
      allowMultiSelection: allowMultiple,
    });

    const files: PDFFile[] = [];

    for (const result of results) {
      // Copy file to local cache for processing
      let localUri = result.uri;
      try {
        const copyResult = await keepLocalCopy({
          files: [{ uri: result.uri, fileName: result.name || 'file.pdf' }],
          destination: 'cachesDirectory',
        });
        if (copyResult && copyResult[0]?.localUri) {
          localUri = copyResult[0].localUri;
        }
      } catch (copyError) {
        console.log('Could not copy file locally, using original URI:', copyError);
      }

      const file = createPDFFileFromPicker({ ...result, localUri });
      if (file) {
        files.push(file);
      }
    }

    return files;
  } catch (error: any) {
    if (isCancel(error)) {
      return [];
    }
    console.error('Error picking files:', error);
    throw error;
  }
};

// Create PDFFile object from picker result
const createPDFFileFromPicker = (result: any): PDFFile | null => {
  try {
    const uri = result.localUri || result.uri;

    const file: PDFFile = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: result.name || 'Unknown.pdf',
      uri: uri,
      size: result.size || 0,
      type: result.type || 'application/pdf',
      pageCount: 0,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };

    return file;
  } catch (error) {
    console.error('Error creating PDF file:', error);
    return null;
  }
};

// Get all stored PDF files - returns empty for now
export const getStoredPDFFiles = async (): Promise<PDFFile[]> => {
  // Storage features disabled due to RNFS issues
  return [];
};

// Copy file to app storage - not available
export const copyFileToStorage = async (_file: PDFFile): Promise<PDFFile | null> => {
  console.warn('Storage features not available');
  return null;
};

// Delete file from storage - not available
export const deleteStoredFile = async (_filePath: string): Promise<boolean> => {
  console.warn('Storage features not available');
  return false;
};

// Ensure directories exist - not available
export const ensureDirectoriesExist = async (): Promise<boolean> => {
  return false;
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
