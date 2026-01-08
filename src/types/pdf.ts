// PDF Master Pro - PDF Types

export interface PDFFile {
  id: string;
  name: string;
  uri: string;
  size: number;
  type: string;
  pageCount?: number;
  createdAt: number;
  modifiedAt: number;
}

export interface ProcessingResult {
  success: boolean;
  file?: PDFFile;
  error?: string;
  savedSize?: number;
  percentage?: number;
}

export interface MergeOptions {
  files: PDFFile[];
  outputName?: string;
}

export interface SplitOptions {
  file: PDFFile;
  ranges?: string; // e.g., "1-3, 5, 7-10"
  pages?: number[];
}

export interface CompressOptions {
  file: PDFFile;
  level: 'low' | 'medium' | 'high';
}

export interface RotateOptions {
  file: PDFFile;
  degrees: 90 | 180 | 270;
  pages?: number[]; // If empty, rotate all
}

export interface ProtectOptions {
  file: PDFFile;
  password: string;
  permissions?: {
    printing?: boolean;
    modifying?: boolean;
    copying?: boolean;
    annotating?: boolean;
  };
}

export interface UnlockOptions {
  file: PDFFile;
  password: string;
}

export interface WatermarkOptions {
  file: PDFFile;
  text: string;
  fontSize?: number;
  color?: string;
  opacity?: number;
  rotation?: number;
  position?: 'center' | 'diagonal';
}

export interface PageNumbersOptions {
  file: PDFFile;
  format: 'numeric' | 'roman' | 'alphabetic';
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  startNumber?: number;
  fontSize?: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
  pages: {
    pageNumber: number;
    text: string;
  }[];
}

export interface OrganizeOptions {
  file: PDFFile;
  pageOrder: number[];
  pagesToDelete?: number[];
}

export interface ConvertOptions {
  file: PDFFile;
  quality?: 'low' | 'medium' | 'high';
  format?: 'jpg' | 'png';
}
