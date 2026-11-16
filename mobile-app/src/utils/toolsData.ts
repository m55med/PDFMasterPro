/**
 * Tools Data
 * Configuration for all PDF tools
 */

import { Tool } from '../components/tools/ToolCard';

export const tools: Tool[] = [
  // Create & Convert
  {
    id: 'merge',
    name: 'Merge PDF',
    description: 'Combine multiple PDFs into one document',
    emoji: '📑',
    category: 'create',
  },
  {
    id: 'split',
    name: 'Split PDF',
    description: 'Extract pages or split into multiple files',
    emoji: '✂️',
    category: 'create',
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    description: 'Convert images to PDF documents',
    emoji: '🖼️',
    category: 'convert',
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Extract pages as image files',
    emoji: '📸',
    category: 'convert',
  },
  {
    id: 'compress',
    name: 'Compress PDF',
    description: 'Reduce file size without losing quality',
    emoji: '🗜️',
    category: 'create',
  },
  
  // Edit & Organize
  {
    id: 'rotate',
    name: 'Rotate Pages',
    description: 'Rotate pages in any direction',
    emoji: '🔄',
    category: 'edit',
  },
  {
    id: 'organize',
    name: 'Organize Pages',
    description: 'Reorder, remove, or duplicate pages',
    emoji: '📋',
    category: 'edit',
  },
  {
    id: 'page-numbers',
    name: 'Page Numbers',
    description: 'Add custom page numbers to your PDF',
    emoji: '🔢',
    category: 'edit',
  },
  
  // Security
  {
    id: 'protect',
    name: 'Protect PDF',
    description: 'Add password protection to PDFs',
    emoji: '🔐',
    category: 'security',
  },
  {
    id: 'unlock',
    name: 'Unlock PDF',
    description: 'Remove password from protected PDFs',
    emoji: '🔓',
    category: 'security',
  },
  {
    id: 'watermark',
    name: 'Watermark',
    description: 'Add text or image watermarks',
    emoji: '💧',
    category: 'security',
  },
  
  // Advanced (Premium)
  {
    id: 'ocr',
    name: 'OCR Text',
    description: 'Extract text from scanned documents',
    emoji: '🔍',
    category: 'advanced',
    isPremium: true,
  },
];

export const toolCategories = [
  { id: 'all', name: 'All Tools', icon: '📦' },
  { id: 'create', name: 'Create & Convert', icon: '📑' },
  { id: 'edit', name: 'Edit', icon: '✏️' },
  { id: 'security', name: 'Security', icon: '🔒' },
  { id: 'advanced', name: 'Advanced', icon: '⚡' },
];
