/**
 * Files Store
 * Manages PDF files and operations
 */

import { create } from 'zustand';

export interface FileMetadata {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  createdAt: Date;
  tool?: string;
  thumbnail?: string;
  isFavorite?: boolean;
}

interface FilesState {
  files: FileMetadata[];
  loading: boolean;
  
  // Actions
  setFiles: (files: FileMetadata[]) => void;
  addFile: (file: FileMetadata) => void;
  removeFile: (id: string) => void;
  updateFile: (id: string, updates: Partial<FileMetadata>) => void;
  toggleFavorite: (id: string) => void;
  clearFiles: () => void;
}

export const useFilesStore = create<FilesState>((set) => ({
  files: [],
  loading: false,
  
  setFiles: (files) => set({ files }),
  
  addFile: (file) =>
    set((state) => ({
      files: [file, ...state.files],
    })),
  
  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    })),
  
  updateFile: (id, updates) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    })),
  
  toggleFavorite: (id) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, isFavorite: !f.isFavorite } : f
      ),
    })),
  
  clearFiles: () => set({ files: [] }),
}));
