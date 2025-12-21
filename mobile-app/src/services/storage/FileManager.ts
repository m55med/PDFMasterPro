/**
 * File Manager Service
 * Handles local file storage and management
 */

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FileMetadata } from '../store';

const FILES_KEY = '@pdf_master:files';
const FILES_DIR = `${FileSystem.documentDirectory}pdf_files/`;

export class FileManager {
  /**
   * Initialize the file system
   */
  static async initialize(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(FILES_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(FILES_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to initialize file system:', error);
      throw error;
    }
  }

  /**
   * Save a file to local storage
   */
  static async saveFile(
    sourcePath: string,
    metadata: Partial<FileMetadata>
  ): Promise<FileMetadata> {
    try {
      await this.initialize();

      const id = Date.now().toString();
      const fileName = metadata.name || `file_${id}.pdf`;
      const destPath = `${FILES_DIR}${fileName}`;

      // Copy file to app directory
      await FileSystem.copyAsync({
        from: sourcePath,
        to: destPath,
      });

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(destPath);

      const file: FileMetadata = {
        id,
        name: fileName,
        path: destPath,
        size: fileInfo.size || 0,
        type: metadata.type || 'application/pdf',
        createdAt: new Date(),
        tool: metadata.tool,
      };

      // Add to index
      await this.addToIndex(file);

      return file;
    } catch (error) {
      console.error('Failed to save file:', error);
      throw error;
    }
  }

  /**
   * Get all saved files
   */
  static async getAllFiles(): Promise<FileMetadata[]> {
    try {
      const json = await AsyncStorage.getItem(FILES_KEY);
      if (!json) return [];

      const files: FileMetadata[] = JSON.parse(json);
      
      // Convert date strings back to Date objects
      return files.map(file => ({
        ...file,
        createdAt: new Date(file.createdAt),
      }));
    } catch (error) {
      console.error('Failed to get files:', error);
      return [];
    }
  }

  /**
   * Get a specific file by ID
   */
  static async getFile(id: string): Promise<FileMetadata | null> {
    const files = await this.getAllFiles();
    return files.find(f => f.id === id) || null;
  }

  /**
   * Delete a file
   */
  static async deleteFile(id: string): Promise<void> {
    try {
      const files = await this.getAllFiles();
      const file = files.find(f => f.id === id);

      if (file) {
        // Delete physical file
        const fileInfo = await FileSystem.getInfoAsync(file.path);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(file.path);
        }

        // Remove from index
        const updated = files.filter(f => f.id !== id);
        await AsyncStorage.setItem(FILES_KEY, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  }

  /**
   * Delete multiple files
   */
  static async deleteFiles(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.deleteFile(id);
    }
  }

  /**
   * Get storage usage
   */
  static async getStorageUsage(): Promise<number> {
    try {
      const files = await this.getAllFiles();
      return files.reduce((total, file) => total + file.size, 0);
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return 0;
    }
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Add file to index
   */
  private static async addToIndex(file: FileMetadata): Promise<void> {
    const files = await this.getAllFiles();
    files.unshift(file);
    await AsyncStorage.setItem(FILES_KEY, JSON.stringify(files));
  }

  /**
   * Share a file
   */
  static async shareFile(filePath: string): Promise<void> {
    // TODO: Implement sharing using expo-sharing
    console.log('Share file:', filePath);
  }

  /**
   * Check if file exists
   */
  static async fileExists(path: string): Promise<boolean> {
    const fileInfo = await FileSystem.getInfoAsync(path);
    return fileInfo.exists;
  }
}
