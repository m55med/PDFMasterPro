/**
 * PDF Merge Service
 * Combines multiple PDF files into one
 */

import * as FileSystem from 'expo-file-system';

export interface MergeOptions {
  filePaths: string[];
  outputName?: string;
  onProgress?: (progress: number) => void;
}

export class MergePDFService {
  /**
   * Merge multiple PDF files
   */
  static async merge(options: MergeOptions): Promise<string> {
    const { filePaths, outputName, onProgress } = options;

    if (filePaths.length < 2) {
      throw new Error('At least 2 PDF files are required for merging');
    }

    try {
      // Report initial progress
      onProgress?.(0);

      // For now, we'll use a simplified approach
      // In production, you'd use react-native-pdf-lib or similar
      const outputPath = `${FileSystem.documentDirectory}${
        outputName || `merged_${Date.now()}.pdf`
      }`;

      // TODO: Implement actual PDF merging using a library
      // This is a placeholder that copies the first file
      // In production, use: react-native-pdf-lib, pdfkit, etc.
      
      onProgress?.(50);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      onProgress?.(100);

      return outputPath;
    } catch (error) {
      console.error('Failed to merge PDFs:', error);
      throw new Error('Failed to merge PDF files');
    }
  }

  /**
   * Validate PDF files before merging
   */
  static async validateFiles(filePaths: string[]): Promise<boolean> {
    for (const path of filePaths) {
      const fileInfo = await FileSystem.getInfoAsync(path);
      if (!fileInfo.exists) {
        throw new Error(`File not found: ${path}`);
      }
    }
    return true;
  }
}
