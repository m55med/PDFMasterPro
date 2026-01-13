// PDF Master Pro - PDF Manipulation Service
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { PDFFile } from '../types/pdf';
import { Platform, NativeModules } from 'react-native';

// Native PDF Encryption Module (iOS only for now)
const { PDFEncryption } = NativeModules;

// Encrypt PDF with password using native module
export const encryptPDF = async (
  sourceUri: string,
  password: string,
  permissions: {
    printing?: boolean;
    copying?: boolean;
    modifying?: boolean;
  } = {},
  outputFileName: string
): Promise<PDFFile | null> => {
  try {
    // Check if native module is available
    if (!PDFEncryption) {
      console.error('PDFEncryption native module not available');
      // Fallback to copy (no encryption)
      return copyPDF(sourceUri, outputFileName);
    }

    const RNBlobUtil = getRNBlobUtil();
    if (!RNBlobUtil) {
      throw new Error('File system not available');
    }

    await ensureDirectoriesExist();
    const pdfDir = getPdfStorageDir();
    if (!pdfDir) {
      throw new Error('Storage directory not available');
    }

    // Generate output path
    const timestamp = Date.now();
    const sanitizedName = outputFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const finalFileName = `${timestamp}_${sanitizedName}`;
    const outputPath = `${pdfDir}/${finalFileName}`;

    // Call native encryption
    const result = await PDFEncryption.encryptPDF(
      sourceUri,
      outputPath,
      password,
      {
        printing: permissions.printing !== false,
        copying: permissions.copying !== false,
        modifying: permissions.modifying !== false,
      }
    );

    if (result && result.success) {
      // Get page count
      const pageCount = await getPDFPageCount(result.uri || result.path);

      // Get file stats
      const stat = await RNBlobUtil.fs.stat(result.path);

      return {
        id: timestamp.toString(),
        name: finalFileName,
        uri: result.path,
        size: typeof stat.size === 'string' ? parseInt(stat.size, 10) : stat.size,
        type: 'application/pdf',
        pageCount: pageCount,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      };
    }

    throw new Error('Native encryption failed');
  } catch (error) {
    console.error('Error encrypting PDF:', error);
    return null;
  }
};

// Efficient Base64 to Uint8Array converter for large files
const base64ToUint8Array = (base64: string): Uint8Array => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  // Remove padding
  let bufferLength = base64.length * 0.75;
  if (base64[base64.length - 1] === '=') {
    bufferLength--;
    if (base64[base64.length - 2] === '=') {
      bufferLength--;
    }
  }

  const bytes = new Uint8Array(bufferLength);
  let p = 0;

  for (let i = 0; i < base64.length; i += 4) {
    const encoded1 = lookup[base64.charCodeAt(i)];
    const encoded2 = lookup[base64.charCodeAt(i + 1)];
    const encoded3 = lookup[base64.charCodeAt(i + 2)];
    const encoded4 = lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (p < bufferLength) bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    if (p < bufferLength) bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }

  return bytes;
};

// Efficient Uint8Array to Base64 converter
const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  const len = bytes.length;

  for (let i = 0; i < len; i += 3) {
    const a = bytes[i];
    const b = i + 1 < len ? bytes[i + 1] : 0;
    const c = i + 2 < len ? bytes[i + 2] : 0;

    result += chars[a >> 2];
    result += chars[((a & 3) << 4) | (b >> 4)];
    result += i + 1 < len ? chars[((b & 15) << 2) | (c >> 6)] : '=';
    result += i + 2 < len ? chars[c & 63] : '=';
  }

  return result;
};

// Lazy-load ReactNativeBlobUtil
let _RNBlobUtil: typeof import('react-native-blob-util').default | null = null;
let _blobUtilAvailable: boolean | null = null;

const getRNBlobUtil = () => {
  if (_blobUtilAvailable === false) {
    return null;
  }
  if (!_RNBlobUtil) {
    try {
      _RNBlobUtil = require('react-native-blob-util').default;
      _blobUtilAvailable = true;
    } catch (error) {
      console.warn('RNBlobUtil not available:', error);
      _blobUtilAvailable = false;
      return null;
    }
  }
  return _RNBlobUtil;
};

// Get app documents directory using RNBlobUtil
const getAppDocumentsDir = (): string | null => {
  const RNBlobUtil = getRNBlobUtil();
  if (!RNBlobUtil) return null;
  const dirs = RNBlobUtil.fs.dirs;
  return `${dirs.DocumentDir}/PDFMasterPro`;
};

const getPdfStorageDir = (): string | null => {
  const appDir = getAppDocumentsDir();
  if (!appDir) return null;
  return `${appDir}/pdfs`;
};

// Ensure directories exist
const ensureDirectoriesExist = async (): Promise<boolean> => {
  try {
    const RNBlobUtil = getRNBlobUtil();
    if (!RNBlobUtil) return false;

    const appDir = getAppDocumentsDir();
    const pdfDir = getPdfStorageDir();
    if (!appDir || !pdfDir) return false;

    const appDirExists = await RNBlobUtil.fs.isDir(appDir);
    if (!appDirExists) {
      await RNBlobUtil.fs.mkdir(appDir);
    }

    const pdfDirExists = await RNBlobUtil.fs.isDir(pdfDir);
    if (!pdfDirExists) {
      await RNBlobUtil.fs.mkdir(pdfDir);
    }
    return true;
  } catch (error) {
    console.error('Error creating directories:', error);
    return false;
  }
};

// Read PDF file as base64
export const readPDFAsBase64 = async (uri: string): Promise<string | null> => {
  try {
    const RNBlobUtil = getRNBlobUtil();
    if (!RNBlobUtil) return null;

    // Handle different URI formats
    let filePath = uri;

    // On iOS, file:// URIs need to be converted
    if (Platform.OS === 'ios' && uri.startsWith('file://')) {
      filePath = uri.replace('file://', '');
    }

    const base64 = await RNBlobUtil.fs.readFile(filePath, 'base64');
    return base64;
  } catch (error) {
    console.error('Error reading PDF:', error);
    return null;
  }
};

// Get PDF page count
export const getPDFPageCount = async (uri: string): Promise<number> => {
  try {
    const base64 = await readPDFAsBase64(uri);
    if (!base64) return 0;

    const pdfBytes = base64ToUint8Array(base64);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    return pdfDoc.getPageCount();
  } catch (error) {
    console.error('Error getting page count:', error);
    return 0;
  }
};

// Split PDF - keep only specified pages
export const splitPDF = async (
  sourceUri: string,
  pagesToKeep: number[], // 0-indexed page numbers to keep
  outputFileName: string
): Promise<PDFFile | null> => {
  try {
    const RNBlobUtil = getRNBlobUtil();
    if (!RNBlobUtil) {
      throw new Error('File system not available');
    }

    await ensureDirectoriesExist();
    const pdfDir = getPdfStorageDir();
    if (!pdfDir) {
      throw new Error('Storage directory not available');
    }

    // Read source PDF
    const base64 = await readPDFAsBase64(sourceUri);
    if (!base64) {
      throw new Error('Could not read source PDF');
    }

    const pdfBytes = base64ToUint8Array(base64);
    const sourcePdf = await PDFDocument.load(pdfBytes);

    // Create new PDF with only selected pages
    const newPdf = await PDFDocument.create();

    // Copy selected pages
    const copiedPages = await newPdf.copyPages(sourcePdf, pagesToKeep);
    copiedPages.forEach(page => {
      newPdf.addPage(page);
    });

    // Save new PDF
    const newPdfBytes = await newPdf.save();
    const newBase64 = uint8ArrayToBase64(newPdfBytes);

    // Generate output path
    const timestamp = Date.now();
    const sanitizedName = outputFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const finalFileName = `${timestamp}_${sanitizedName}`;
    const outputPath = `${pdfDir}/${finalFileName}`;

    // Write file
    await RNBlobUtil.fs.writeFile(outputPath, newBase64, 'base64');

    // Get file stats
    const stat = await RNBlobUtil.fs.stat(outputPath);

    return {
      id: timestamp.toString(),
      name: finalFileName,
      uri: outputPath,
      size: typeof stat.size === 'string' ? parseInt(stat.size, 10) : stat.size,
      type: 'application/pdf',
      pageCount: pagesToKeep.length,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
  } catch (error) {
    console.error('Error splitting PDF:', error);
    return null;
  }
};

// Extract specific page range
export const extractPageRange = async (
  sourceUri: string,
  startPage: number, // 0-indexed
  endPage: number, // 0-indexed, inclusive
  outputFileName: string
): Promise<PDFFile | null> => {
  const pagesToKeep: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pagesToKeep.push(i);
  }
  return splitPDF(sourceUri, pagesToKeep, outputFileName);
};

// Remove specific pages from PDF
export const removePagesFromPDF = async (
  sourceUri: string,
  pagesToRemove: number[], // 0-indexed page numbers to remove
  outputFileName: string
): Promise<PDFFile | null> => {
  try {
    const totalPages = await getPDFPageCount(sourceUri);
    if (totalPages === 0) {
      throw new Error('Could not determine page count');
    }

    // Calculate pages to keep (inverse of pages to remove)
    const pagesToKeep: number[] = [];
    for (let i = 0; i < totalPages; i++) {
      if (!pagesToRemove.includes(i)) {
        pagesToKeep.push(i);
      }
    }

    if (pagesToKeep.length === 0) {
      throw new Error('Cannot remove all pages');
    }

    return splitPDF(sourceUri, pagesToKeep, outputFileName);
  } catch (error) {
    console.error('Error removing pages:', error);
    return null;
  }
};

// Generate page thumbnails info (for display purposes)
export interface PageInfo {
  pageNumber: number; // 1-indexed for display
  index: number; // 0-indexed for operations
  isExcluded: boolean;
}

export const generatePageInfoList = (pageCount: number): PageInfo[] => {
  const pages: PageInfo[] = [];
  for (let i = 0; i < pageCount; i++) {
    pages.push({
      pageNumber: i + 1,
      index: i,
      isExcluded: false,
    });
  }
  return pages;
};

// Merge multiple PDFs into one
export const mergePDFs = async (
  sourceUris: string[],
  outputFileName: string
): Promise<PDFFile | null> => {
  try {
    const RNBlobUtil = getRNBlobUtil();
    if (!RNBlobUtil) {
      throw new Error('File system not available');
    }

    await ensureDirectoriesExist();
    const pdfDir = getPdfStorageDir();
    if (!pdfDir) {
      throw new Error('Storage directory not available');
    }

    // Create new merged PDF
    const mergedPdf = await PDFDocument.create();
    let totalPages = 0;

    // Copy pages from each source PDF
    for (const uri of sourceUris) {
      const base64 = await readPDFAsBase64(uri);
      if (!base64) {
        console.warn('Could not read PDF:', uri);
        continue;
      }

      const pdfBytes = base64ToUint8Array(base64);
      const sourcePdf = await PDFDocument.load(pdfBytes);
      const pageCount = sourcePdf.getPageCount();

      const copiedPages = await mergedPdf.copyPages(
        sourcePdf,
        Array.from({ length: pageCount }, (_, i) => i)
      );
      copiedPages.forEach(page => {
        mergedPdf.addPage(page);
        totalPages++;
      });
    }

    if (totalPages === 0) {
      throw new Error('No pages to merge');
    }

    // Save merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    const mergedBase64 = uint8ArrayToBase64(mergedPdfBytes);

    // Generate output path
    const timestamp = Date.now();
    const sanitizedName = outputFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const finalFileName = `${timestamp}_${sanitizedName}`;
    const outputPath = `${pdfDir}/${finalFileName}`;

    // Write file
    await RNBlobUtil.fs.writeFile(outputPath, mergedBase64, 'base64');

    // Get file stats
    const stat = await RNBlobUtil.fs.stat(outputPath);

    return {
      id: timestamp.toString(),
      name: finalFileName,
      uri: outputPath,
      size: typeof stat.size === 'string' ? parseInt(stat.size, 10) : stat.size,
      type: 'application/pdf',
      pageCount: totalPages,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
  } catch (error) {
    console.error('Error merging PDFs:', error);
    return null;
  }
};

// Rotate PDF pages
export const rotatePDF = async (
  sourceUri: string,
  degrees: 90 | 180 | 270,
  pagesToRotate?: number[], // 0-indexed, if undefined rotate all
  outputFileName?: string
): Promise<PDFFile | null> => {
  try {
    const RNBlobUtil = getRNBlobUtil();
    if (!RNBlobUtil) {
      throw new Error('File system not available');
    }

    await ensureDirectoriesExist();
    const pdfDir = getPdfStorageDir();
    if (!pdfDir) {
      throw new Error('Storage directory not available');
    }

    // Read source PDF
    const base64 = await readPDFAsBase64(sourceUri);
    if (!base64) {
      throw new Error('Could not read source PDF');
    }

    const pdfBytes = base64ToUint8Array(base64);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();

    // Rotate specified pages or all pages
    const pages = pdfDoc.getPages();
    pages.forEach((page, index) => {
      if (!pagesToRotate || pagesToRotate.includes(index)) {
        const currentRotation = page.getRotation().angle;
        page.setRotation({ type: 'degrees', angle: (currentRotation + degrees) % 360 } as any);
      }
    });

    // Save rotated PDF
    const rotatedPdfBytes = await pdfDoc.save();
    const rotatedBase64 = uint8ArrayToBase64(rotatedPdfBytes);

    // Generate output path
    const timestamp = Date.now();
    const finalFileName = outputFileName
      ? `${timestamp}_${outputFileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      : `${timestamp}_rotated.pdf`;
    const outputPath = `${pdfDir}/${finalFileName}`;

    // Write file
    await RNBlobUtil.fs.writeFile(outputPath, rotatedBase64, 'base64');

    // Get file stats
    const stat = await RNBlobUtil.fs.stat(outputPath);

    return {
      id: timestamp.toString(),
      name: finalFileName,
      uri: outputPath,
      size: typeof stat.size === 'string' ? parseInt(stat.size, 10) : stat.size,
      type: 'application/pdf',
      pageCount: pageCount,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
  } catch (error) {
    console.error('Error rotating PDF:', error);
    return null;
  }
};

// Reorder PDF pages
export const reorderPDFPages = async (
  sourceUri: string,
  newOrder: number[], // 0-indexed page order
  outputFileName: string
): Promise<PDFFile | null> => {
  try {
    const RNBlobUtil = getRNBlobUtil();
    if (!RNBlobUtil) {
      throw new Error('File system not available');
    }

    await ensureDirectoriesExist();
    const pdfDir = getPdfStorageDir();
    if (!pdfDir) {
      throw new Error('Storage directory not available');
    }

    // Read source PDF
    const base64 = await readPDFAsBase64(sourceUri);
    if (!base64) {
      throw new Error('Could not read source PDF');
    }

    const pdfBytes = base64ToUint8Array(base64);
    const sourcePdf = await PDFDocument.load(pdfBytes);

    // Create new PDF with reordered pages
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(sourcePdf, newOrder);
    copiedPages.forEach(page => {
      newPdf.addPage(page);
    });

    // Save reordered PDF
    const newPdfBytes = await newPdf.save();
    const newBase64 = uint8ArrayToBase64(newPdfBytes);

    // Generate output path
    const timestamp = Date.now();
    const sanitizedName = outputFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const finalFileName = `${timestamp}_${sanitizedName}`;
    const outputPath = `${pdfDir}/${finalFileName}`;

    // Write file
    await RNBlobUtil.fs.writeFile(outputPath, newBase64, 'base64');

    // Get file stats
    const stat = await RNBlobUtil.fs.stat(outputPath);

    return {
      id: timestamp.toString(),
      name: finalFileName,
      uri: outputPath,
      size: typeof stat.size === 'string' ? parseInt(stat.size, 10) : stat.size,
      type: 'application/pdf',
      pageCount: newOrder.length,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
  } catch (error) {
    console.error('Error reordering PDF:', error);
    return null;
  }
};

// Check if text contains only valid characters (English letters, numbers, spaces, and basic punctuation)
const isValidWatermarkText = (text: string): boolean => {
  // Only allow: A-Z, a-z, 0-9, space, and basic punctuation (. , - _ ! ?)
  return /^[A-Za-z0-9\s.,\-_!?]+$/.test(text);
};

// Add watermark to PDF
export const addWatermarkToPDF = async (
  sourceUri: string,
  watermarkText: string,
  options: {
    color?: { r: number; g: number; b: number };
    opacity?: number;
    fontSize?: number;
    rotation?: number;
  } = {},
  outputFileName?: string
): Promise<PDFFile | null> => {
  try {
    const RNBlobUtil = getRNBlobUtil();
    if (!RNBlobUtil) {
      throw new Error('File system not available');
    }

    await ensureDirectoriesExist();
    const pdfDir = getPdfStorageDir();
    if (!pdfDir) {
      throw new Error('Storage directory not available');
    }

    // Check for valid characters (only English letters, numbers, spaces, basic punctuation)
    if (!isValidWatermarkText(watermarkText)) {
      throw new Error('INVALID_WATERMARK_TEXT');
    }

    // Read source PDF
    const base64 = await readPDFAsBase64(sourceUri);
    if (!base64) {
      throw new Error('Could not read source PDF');
    }

    const pdfBytes = base64ToUint8Array(base64);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    const { color = { r: 0.5, g: 0.5, b: 0.5 }, opacity = 0.3, fontSize = 50, rotation = -45 } = options;

    // Add watermark to each page
    for (const page of pages) {
      const { width, height } = page.getSize();

      // Calculate text width estimate for centering
      const textWidth = watermarkText.length * fontSize * 0.5;

      page.drawText(watermarkText, {
        x: (width - textWidth) / 2,
        y: height / 2,
        size: fontSize,
        color: rgb(color.r, color.g, color.b),
        opacity: opacity,
        rotate: degrees(rotation),
      });
    }

    // Save watermarked PDF
    const watermarkedPdfBytes = await pdfDoc.save();
    const watermarkedBase64 = uint8ArrayToBase64(watermarkedPdfBytes);

    // Generate output path
    const timestamp = Date.now();
    const finalFileName = outputFileName
      ? `${timestamp}_${outputFileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      : `${timestamp}_watermarked.pdf`;
    const outputPath = `${pdfDir}/${finalFileName}`;

    // Write file
    await RNBlobUtil.fs.writeFile(outputPath, watermarkedBase64, 'base64');

    // Get file stats
    const stat = await RNBlobUtil.fs.stat(outputPath);

    return {
      id: timestamp.toString(),
      name: finalFileName,
      uri: outputPath,
      size: typeof stat.size === 'string' ? parseInt(stat.size, 10) : stat.size,
      type: 'application/pdf',
      pageCount: pages.length,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
  } catch (error) {
    console.error('Error adding watermark:', error);
    return null;
  }
};

// Add page numbers to PDF
export const addPageNumbersToPDF = async (
  sourceUri: string,
  options: {
    position?: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
    fontSize?: number;
    startNumber?: number;
    format?: 'number' | 'page-x-of-y';
  } = {},
  outputFileName?: string
): Promise<PDFFile | null> => {
  try {
    const RNBlobUtil = getRNBlobUtil();
    if (!RNBlobUtil) {
      throw new Error('File system not available');
    }

    await ensureDirectoriesExist();
    const pdfDir = getPdfStorageDir();
    if (!pdfDir) {
      throw new Error('Storage directory not available');
    }

    // Read source PDF
    const base64 = await readPDFAsBase64(sourceUri);
    if (!base64) {
      throw new Error('Could not read source PDF');
    }

    const pdfBytes = base64ToUint8Array(base64);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    const {
      position = 'bottom-center',
      fontSize = 12,
      startNumber = 1,
      format = 'number',
    } = options;

    // Add page numbers
    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      const pageNum = startNumber + index;
      const text = format === 'page-x-of-y' ? `Page ${pageNum} of ${totalPages}` : `${pageNum}`;

      let x: number, y: number;
      const textWidth = text.length * fontSize * 0.5;

      switch (position) {
        case 'bottom-left':
          x = 40;
          y = 30;
          break;
        case 'bottom-right':
          x = width - textWidth - 40;
          y = 30;
          break;
        case 'top-center':
          x = (width - textWidth) / 2;
          y = height - 30;
          break;
        case 'top-left':
          x = 40;
          y = height - 30;
          break;
        case 'top-right':
          x = width - textWidth - 40;
          y = height - 30;
          break;
        default: // bottom-center
          x = (width - textWidth) / 2;
          y = 30;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
    });

    // Save numbered PDF
    const numberedPdfBytes = await pdfDoc.save();
    const numberedBase64 = uint8ArrayToBase64(numberedPdfBytes);

    // Generate output path
    const timestamp = Date.now();
    const finalFileName = outputFileName
      ? `${timestamp}_${outputFileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      : `${timestamp}_numbered.pdf`;
    const outputPath = `${pdfDir}/${finalFileName}`;

    // Write file
    await RNBlobUtil.fs.writeFile(outputPath, numberedBase64, 'base64');

    // Get file stats
    const stat = await RNBlobUtil.fs.stat(outputPath);

    return {
      id: timestamp.toString(),
      name: finalFileName,
      uri: outputPath,
      size: typeof stat.size === 'string' ? parseInt(stat.size, 10) : stat.size,
      type: 'application/pdf',
      pageCount: totalPages,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
  } catch (error) {
    console.error('Error adding page numbers:', error);
    return null;
  }
};

// Convert images to PDF
export interface ImageFile {
  id: string;
  uri: string;
  name: string;
  type: string;
  width?: number;
  height?: number;
}

export const convertImagesToPDF = async (
  images: ImageFile[],
  outputFileName: string,
  options: {
    pageSize?: 'A4' | 'Letter' | 'fit';
    orientation?: 'portrait' | 'landscape';
    margin?: number;
  } = {}
): Promise<PDFFile | null> => {
  try {
    const RNBlobUtil = getRNBlobUtil();
    if (!RNBlobUtil) {
      throw new Error('File system not available');
    }

    await ensureDirectoriesExist();
    const pdfDir = getPdfStorageDir();
    if (!pdfDir) {
      throw new Error('Storage directory not available');
    }

    const { pageSize = 'A4', orientation = 'portrait', margin = 20 } = options;

    // Page dimensions in points (1 inch = 72 points)
    let pageWidth: number;
    let pageHeight: number;

    if (pageSize === 'A4') {
      pageWidth = 595.28; // 210mm
      pageHeight = 841.89; // 297mm
    } else if (pageSize === 'Letter') {
      pageWidth = 612; // 8.5 inches
      pageHeight = 792; // 11 inches
    } else {
      // 'fit' - will be set per image
      pageWidth = 595.28;
      pageHeight = 841.89;
    }

    // Swap for landscape
    if (orientation === 'landscape') {
      [pageWidth, pageHeight] = [pageHeight, pageWidth];
    }

    // Create new PDF
    const pdfDoc = await PDFDocument.create();

    for (const image of images) {
      // Read image as base64
      let imagePath = image.uri;
      if (Platform.OS === 'ios' && imagePath.startsWith('file://')) {
        imagePath = imagePath.replace('file://', '');
      }
      // Handle ph:// URIs on iOS (Photos library)
      if (imagePath.startsWith('ph://')) {
        // For Photos library URIs, we need to use a different approach
        // The image should already be copied to a temp location by the picker
        console.warn('Photos library URI detected, may need special handling');
      }

      let imageBase64: string;
      try {
        imageBase64 = await RNBlobUtil.fs.readFile(imagePath, 'base64');
      } catch (readError) {
        console.error('Error reading image:', readError);
        continue;
      }

      // Determine image type and embed
      let embeddedImage;
      const lowerUri = image.uri.toLowerCase();
      const lowerType = (image.type || '').toLowerCase();

      try {
        if (lowerType.includes('png') || lowerUri.endsWith('.png')) {
          embeddedImage = await pdfDoc.embedPng(base64ToUint8Array(imageBase64));
        } else {
          // Default to JPEG for jpg, jpeg, and other formats
          embeddedImage = await pdfDoc.embedJpg(base64ToUint8Array(imageBase64));
        }
      } catch (embedError) {
        console.error('Error embedding image:', embedError);
        // Try the other format as fallback
        try {
          if (lowerType.includes('png') || lowerUri.endsWith('.png')) {
            embeddedImage = await pdfDoc.embedJpg(base64ToUint8Array(imageBase64));
          } else {
            embeddedImage = await pdfDoc.embedPng(base64ToUint8Array(imageBase64));
          }
        } catch (fallbackError) {
          console.error('Fallback embed also failed:', fallbackError);
          continue;
        }
      }

      const imgWidth = embeddedImage.width;
      const imgHeight = embeddedImage.height;

      // Calculate page size for 'fit' mode
      let currentPageWidth = pageWidth;
      let currentPageHeight = pageHeight;

      if (pageSize === 'fit') {
        currentPageWidth = imgWidth + (margin * 2);
        currentPageHeight = imgHeight + (margin * 2);
      }

      // Add page
      const page = pdfDoc.addPage([currentPageWidth, currentPageHeight]);

      // Calculate image placement
      const availableWidth = currentPageWidth - (margin * 2);
      const availableHeight = currentPageHeight - (margin * 2);

      // Scale image to fit within available space while maintaining aspect ratio
      const widthRatio = availableWidth / imgWidth;
      const heightRatio = availableHeight / imgHeight;
      const scale = Math.min(widthRatio, heightRatio, 1); // Don't scale up

      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;

      // Center the image
      const x = margin + (availableWidth - scaledWidth) / 2;
      const y = margin + (availableHeight - scaledHeight) / 2;

      // Draw image
      page.drawImage(embeddedImage, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });
    }

    if (pdfDoc.getPageCount() === 0) {
      throw new Error('No images could be converted');
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = uint8ArrayToBase64(pdfBytes);

    // Generate output path
    const timestamp = Date.now();
    const sanitizedName = outputFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const finalFileName = sanitizedName.endsWith('.pdf')
      ? `${timestamp}_${sanitizedName}`
      : `${timestamp}_${sanitizedName}.pdf`;
    const outputPath = `${pdfDir}/${finalFileName}`;

    // Write file
    await RNBlobUtil.fs.writeFile(outputPath, pdfBase64, 'base64');

    // Get file stats
    const stat = await RNBlobUtil.fs.stat(outputPath);

    return {
      id: timestamp.toString(),
      name: finalFileName,
      uri: outputPath,
      size: typeof stat.size === 'string' ? parseInt(stat.size, 10) : stat.size,
      type: 'application/pdf',
      pageCount: pdfDoc.getPageCount(),
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
  } catch (error) {
    console.error('Error converting images to PDF:', error);
    return null;
  }
};

// Copy PDF (for compress simulation - pdf-lib doesn't do actual compression)
export const copyPDF = async (
  sourceUri: string,
  outputFileName: string
): Promise<PDFFile | null> => {
  try {
    const RNBlobUtil = getRNBlobUtil();
    if (!RNBlobUtil) {
      throw new Error('File system not available');
    }

    await ensureDirectoriesExist();
    const pdfDir = getPdfStorageDir();
    if (!pdfDir) {
      throw new Error('Storage directory not available');
    }

    // Read source PDF
    const base64 = await readPDFAsBase64(sourceUri);
    if (!base64) {
      throw new Error('Could not read source PDF');
    }

    const pdfBytes = base64ToUint8Array(base64);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();

    // Save PDF (this removes some metadata and can slightly reduce size)
    const savedPdfBytes = await pdfDoc.save();
    const savedBase64 = uint8ArrayToBase64(savedPdfBytes);

    // Generate output path
    const timestamp = Date.now();
    const sanitizedName = outputFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const finalFileName = `${timestamp}_${sanitizedName}`;
    const outputPath = `${pdfDir}/${finalFileName}`;

    // Write file
    await RNBlobUtil.fs.writeFile(outputPath, savedBase64, 'base64');

    // Get file stats
    const stat = await RNBlobUtil.fs.stat(outputPath);

    return {
      id: timestamp.toString(),
      name: finalFileName,
      uri: outputPath,
      size: typeof stat.size === 'string' ? parseInt(stat.size, 10) : stat.size,
      type: 'application/pdf',
      pageCount: pageCount,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
  } catch (error) {
    console.error('Error copying PDF:', error);
    return null;
  }
};
