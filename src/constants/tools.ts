// PDF Master Pro - Tools Configuration
import { Colors } from './colors';

export type ToolCategory = 'create' | 'edit' | 'security' | 'advanced';

export interface Tool {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  colors: readonly [string, string];
  category: ToolCategory;
  screen: string;
  isAvailable: boolean;
}

export const TOOLS: Tool[] = [
  // Create & Convert
  {
    id: 'merge',
    name: 'Merge PDF',
    nameAr: 'دمج PDF',
    description: 'Combine multiple PDFs into one',
    descriptionAr: 'دمج عدة ملفات PDF في ملف واحد',
    icon: 'link',
    colors: Colors.toolMerge,
    category: 'create',
    screen: 'MergeScreen',
    isAvailable: true,
  },
  {
    id: 'split',
    name: 'Split PDF',
    nameAr: 'تقسيم PDF',
    description: 'Split PDF into separate files',
    descriptionAr: 'تقسيم ملف PDF إلى ملفات منفصلة',
    icon: 'scissors',
    colors: Colors.toolSplit,
    category: 'create',
    screen: 'SplitScreen',
    isAvailable: true,
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    nameAr: 'JPG إلى PDF',
    description: 'Convert images to PDF',
    descriptionAr: 'تحويل الصور إلى PDF',
    icon: 'image',
    colors: Colors.toolJpgToPdf,
    category: 'create',
    screen: 'JpgToPdfScreen',
    isAvailable: true,
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    nameAr: 'PDF إلى JPG',
    description: 'Convert PDF pages to images',
    descriptionAr: 'تحويل صفحات PDF إلى صور',
    icon: 'file-image',
    colors: Colors.toolPdfToJpg,
    category: 'create',
    screen: 'PdfToJpgScreen',
    isAvailable: true,
  },

  // Edit & Organize
  {
    id: 'compress',
    name: 'Compress',
    nameAr: 'ضغط',
    description: 'Reduce PDF file size',
    descriptionAr: 'تقليل حجم ملف PDF',
    icon: 'archive',
    colors: Colors.toolCompress,
    category: 'edit',
    screen: 'CompressScreen',
    isAvailable: true,
  },
  {
    id: 'rotate',
    name: 'Rotate',
    nameAr: 'تدوير',
    description: 'Rotate PDF pages',
    descriptionAr: 'تدوير صفحات PDF',
    icon: 'rotate-cw',
    colors: Colors.toolRotate,
    category: 'edit',
    screen: 'RotateScreen',
    isAvailable: true,
  },
  {
    id: 'organize',
    name: 'Organize',
    nameAr: 'تنظيم',
    description: 'Reorder and delete pages',
    descriptionAr: 'إعادة ترتيب وحذف الصفحات',
    icon: 'layers',
    colors: Colors.toolOrganize,
    category: 'edit',
    screen: 'OrganizeScreen',
    isAvailable: true,
  },

  // Security
  {
    id: 'protect',
    name: 'Protect',
    nameAr: 'حماية',
    description: 'Add password protection',
    descriptionAr: 'إضافة حماية بكلمة مرور',
    icon: 'lock',
    colors: Colors.toolProtect,
    category: 'security',
    screen: 'ProtectScreen',
    isAvailable: true,
  },
  {
    id: 'unlock',
    name: 'Unlock',
    nameAr: 'فك الحماية',
    description: 'Remove password protection',
    descriptionAr: 'إزالة الحماية بكلمة المرور',
    icon: 'unlock',
    colors: Colors.toolUnlock,
    category: 'security',
    screen: 'UnlockScreen',
    isAvailable: true,
  },

  // Advanced
  {
    id: 'watermark',
    name: 'Watermark',
    nameAr: 'علامة مائية',
    description: 'Add text watermark',
    descriptionAr: 'إضافة علامة مائية نصية',
    icon: 'droplet',
    colors: Colors.toolWatermark,
    category: 'advanced',
    screen: 'WatermarkScreen',
    isAvailable: true,
  },
  {
    id: 'page-numbers',
    name: 'Page Numbers',
    nameAr: 'أرقام الصفحات',
    description: 'Add page numbers',
    descriptionAr: 'إضافة أرقام الصفحات',
    icon: 'hash',
    colors: Colors.toolPageNumbers,
    category: 'advanced',
    screen: 'PageNumbersScreen',
    isAvailable: true,
  },
  {
    id: 'ocr',
    name: 'OCR',
    nameAr: 'استخراج النص',
    description: 'Extract text from images',
    descriptionAr: 'استخراج النص من الصور',
    icon: 'eye',
    colors: Colors.toolOCR,
    category: 'advanced',
    screen: 'OCRScreen',
    isAvailable: true,
  },
];

export const TOOL_CATEGORIES = [
  { id: 'all', name: 'All', nameAr: 'الكل' },
  { id: 'create', name: 'Create', nameAr: 'إنشاء' },
  { id: 'edit', name: 'Edit', nameAr: 'تعديل' },
  { id: 'security', name: 'Security', nameAr: 'حماية' },
  { id: 'advanced', name: 'Advanced', nameAr: 'متقدم' },
];

export const getToolById = (id: string): Tool | undefined => {
  return TOOLS.find(tool => tool.id === id);
};

export const getToolsByCategory = (category: ToolCategory | 'all'): Tool[] => {
  if (category === 'all') return TOOLS;
  return TOOLS.filter(tool => tool.category === category);
};
