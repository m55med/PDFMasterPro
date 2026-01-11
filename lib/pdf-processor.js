// PDF Master Pro - PDF Processing Library
// Core PDF manipulation using PDF-lib

// This file is loaded as a module - CDN libraries will be loaded dynamically

class PDFProcessor {
    constructor() {
        this.pdfLib = null;
        this.initialized = false;
    }

    /**
     * Filter text to only include WinAnsi-compatible characters
     * Standard PDF fonts (Helvetica, Times, etc.) only support Latin characters
     * @param {string} text - Input text
     * @returns {string} - Filtered text with only supported characters
     */
    filterSupportedText(text) {
        let filtered = '';
        for (const char of text) {
            const code = char.charCodeAt(0);
            // Allow: space, printable ASCII, Latin-1 Supplement
            if ((code >= 0x0020 && code <= 0x007E) || (code >= 0x00A0 && code <= 0x00FF)) {
                filtered += char;
            } else if (char === '\n' || char === '\r' || char === '\t') {
                filtered += char;
            } else {
                filtered += ''; // Remove unsupported characters
            }
        }
        return filtered || 'WATERMARK'; // Fallback if all characters filtered
    }

    // Load PDF-lib dynamically
    async init() {
        if (this.initialized) return this;

        try {
            // Load PDF-lib from CDN or Local
            if (!window.PDFLib) {
                // Try to load via relative path if not present (simplified fallback)
                // In this extension, we enforce loading via script tag in HTML
                throw new Error('PDFLib not loaded. Please ensure pdf-lib.min.js is included in the HTML.');
            }
            this.pdfLib = window.PDFLib;
            this.initialized = true;
            console.log('PDF Processor initialized successfully');
        } catch (error) {
            console.error('Failed to initialize PDF Processor:', error);
            throw error;
        }

        return this;
    }

    // Load external script
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Ensure initialized
    async ensureInit() {
        if (!this.initialized) {
            await this.init();
        }
    }

    // ==================== MERGE ====================

    /**
     * Merge multiple PDF files into one
     * @param {File[]} files - Array of PDF files
     * @param {Object} options - Merge options
     * @returns {Uint8Array} - Merged PDF bytes
     */
    async mergePDFs(files, _options = {}) {
        await this.ensureInit();

        const { PDFDocument } = this.pdfLib;
        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
            try {
                const arrayBuffer = await this.fileToArrayBuffer(file);
                const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
                const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                pages.forEach(page => mergedPdf.addPage(page));
            } catch (error) {
                console.error(`Failed to process file ${file.name}:`, error);
                throw new Error(`Failed to process ${file.name}: ${error.message}`);
            }
        }

        return await mergedPdf.save();
    }

    // ==================== SPLIT ====================

    /**
     * Split PDF by page ranges
     * @param {File} file - PDF file
     * @param {Array} ranges - Array of {start, end} objects (1-indexed)
     * @param {Object} options - Options { excludedPages: Set<number> } (1-indexed)
     * @returns {Array<{name: string, data: Uint8Array}>} - Split PDFs
     */
    async splitByRanges(file, ranges, options = {}) {
        await this.ensureInit();

        const { PDFDocument } = this.pdfLib;
        const arrayBuffer = await this.fileToArrayBuffer(file);
        const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const results = [];
        const excluded = options.excludedPages || new Set();

        for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            const newPdf = await PDFDocument.create();

            // Convert 1-indexed to 0-indexed
            const startIdx = Math.max(0, range.start - 1);
            const endIdx = Math.min(sourcePdf.getPageCount() - 1, range.end - 1);

            const pageIndices = [];
            for (let j = startIdx; j <= endIdx; j++) {
                // Check if page (j+1) is excluded
                if (!excluded.has(j + 1)) {
                    pageIndices.push(j);
                }
            }

            if (pageIndices.length > 0) {
                const pages = await newPdf.copyPages(sourcePdf, pageIndices);
                pages.forEach(page => newPdf.addPage(page));

                const baseName = file.name.replace('.pdf', '');
                results.push({
                    name: `${baseName}_pages_${range.start}-${range.end}.pdf`,
                    data: await newPdf.save()
                });
            }
        }

        return results;
    }

    /**
     * Extract specific pages
     * @param {File} file - PDF file
     * @param {number[]} pageNumbers - Array of page numbers (1-indexed)
     * @returns {Uint8Array} - Extracted PDF bytes
     */
    async extractPages(file, pageNumbers) {
        await this.ensureInit();

        const { PDFDocument } = this.pdfLib;
        const arrayBuffer = await this.fileToArrayBuffer(file);
        const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const newPdf = await PDFDocument.create();

        // Convert 1-indexed to 0-indexed and validate
        const pageIndices = pageNumbers
            .map(n => n - 1)
            .filter(n => n >= 0 && n < sourcePdf.getPageCount());

        const pages = await newPdf.copyPages(sourcePdf, pageIndices);
        pages.forEach(page => newPdf.addPage(page));

        return await newPdf.save();
    }

    /**
     * Split into individual pages
     * @param {File} file - PDF file
     * @param {Object} options - Options { excludedPages: Set<number> } (1-indexed)
     * @returns {Array<{name: string, data: Uint8Array}>} - Individual page PDFs
     */
    async splitAllPages(file, options = {}) {
        await this.ensureInit();

        const { PDFDocument } = this.pdfLib;
        const arrayBuffer = await this.fileToArrayBuffer(file);
        const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const results = [];
        const baseName = file.name.replace('.pdf', '');
        const excluded = options.excludedPages || new Set();

        for (let i = 0; i < sourcePdf.getPageCount(); i++) {
            // Check if page (i+1) is excluded
            if (excluded.has(i + 1)) continue;

            const newPdf = await PDFDocument.create();
            const [page] = await newPdf.copyPages(sourcePdf, [i]);
            newPdf.addPage(page);

            results.push({
                name: `${baseName}_page_${i + 1}.pdf`,
                data: await newPdf.save()
            });
        }

        return results;
    }

    // ==================== COMPRESS ====================

    /**
     * Compress PDF (basic compression by removing unused objects)
     * @param {File} file - PDF file
     * @param {string} level - Compression level: 'low', 'medium', 'high'
     * @returns {Uint8Array} - Compressed PDF bytes
     */
    async compressPDF(file, level = 'medium') {
        await this.ensureInit();

        const { PDFDocument } = this.pdfLib;
        const arrayBuffer = await this.fileToArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

        // Get compression options based on level
        const options = this.getCompressionOptions(level);

        // Save with compression options
        const compressedBytes = await pdf.save({
            useObjectStreams: options.useObjectStreams,
            addDefaultPage: false,
            objectsPerTick: options.objectsPerTick
        });

        return compressedBytes;
    }

    getCompressionOptions(level) {
        const options = {
            low: {
                useObjectStreams: false,
                objectsPerTick: 100
            },
            medium: {
                useObjectStreams: true,
                objectsPerTick: 50
            },
            high: {
                useObjectStreams: true,
                objectsPerTick: 20
            }
        };
        return options[level] || options.medium;
    }

    // ==================== ROTATE ====================

    /**
     * Rotate PDF pages
     * @param {File} file - PDF file
     * @param {number} degrees - Rotation degrees (90, 180, 270)
     * @param {number[]|null} pages - Specific pages to rotate (1-indexed), null for all
     * @returns {Uint8Array} - Rotated PDF bytes
     */
    async rotatePDF(file, degrees, pages = null) {
        await this.ensureInit();

        const { PDFDocument, degrees: degreesFn } = this.pdfLib;
        const arrayBuffer = await this.fileToArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

        const pdfPages = pdf.getPages();
        const rotationDegrees = degreesFn(degrees);

        if (pages === null) {
            // Rotate all pages
            pdfPages.forEach(page => {
                page.setRotation(rotationDegrees);
            });
        } else {
            // Rotate specific pages (1-indexed)
            pages.forEach(pageNum => {
                const idx = pageNum - 1;
                if (idx >= 0 && idx < pdfPages.length) {
                    pdfPages[idx].setRotation(rotationDegrees);
                }
            });
        }

        return await pdf.save();
    }

    /**
     * Rotate PDF pages with individual rotation per page
     * @param {File} file - PDF file
     * @param {Object} pageRotations - Object mapping page numbers (1-indexed) to degrees { 1: 90, 2: 180, ... }
     * @returns {Uint8Array} - Rotated PDF bytes
     */
    async rotatePDFPerPage(file, pageRotations) {
        await this.ensureInit();

        const { PDFDocument, degrees: degreesFn } = this.pdfLib;
        const arrayBuffer = await this.fileToArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

        const pdfPages = pdf.getPages();

        // Apply rotation to each page based on pageRotations object
        Object.entries(pageRotations).forEach(([pageNum, degrees]) => {
            const idx = parseInt(pageNum) - 1;
            if (idx >= 0 && idx < pdfPages.length && degrees !== 0) {
                // Get current rotation and add new rotation
                const currentRotation = pdfPages[idx].getRotation().angle;
                const newRotation = (currentRotation + degrees) % 360;
                pdfPages[idx].setRotation(degreesFn(newRotation));
            }
        });

        return await pdf.save();
    }

    // ==================== PAGE NUMBERS ====================

    /**
     * Add page numbers to PDF
     * @param {File} file - PDF file
     * @param {Object} options - Page number options
     * @returns {Uint8Array} - PDF with page numbers
     */
    async addPageNumbers(file, options = {}) {
        await this.ensureInit();

        const { PDFDocument, rgb, StandardFonts } = this.pdfLib;
        const arrayBuffer = await this.fileToArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

        const {
            position = 'bottom-center',
            startFrom = 1,
            fontSize = 12,
            format = 'numeric' // 'numeric', 'roman', 'alpha'
        } = options;

        const font = await pdf.embedFont(StandardFonts.Helvetica);
        const pages = pdf.getPages();

        pages.forEach((page, index) => {
            const pageNumber = index + startFrom;
            const text = this.formatPageNumber(pageNumber, format);
            const { width, height } = page.getSize();

            const textWidth = font.widthOfTextAtSize(text, fontSize);
            const pos = this.getPageNumberPosition(position, width, height, textWidth, fontSize);

            page.drawText(text, {
                x: pos.x,
                y: pos.y,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0)
            });
        });

        return await pdf.save();
    }

    formatPageNumber(num, format) {
        switch (format) {
            case 'roman':
                return this.toRoman(num);
            case 'alpha':
                return this.toAlpha(num);
            default:
                return String(num);
        }
    }

    toRoman(num) {
        const romanNumerals = [
            ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
            ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
            ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
        ];
        let result = '';
        for (const [letter, value] of romanNumerals) {
            while (num >= value) {
                result += letter;
                num -= value;
            }
        }
        return result.toLowerCase();
    }

    toAlpha(num) {
        let result = '';
        while (num > 0) {
            num--;
            result = String.fromCharCode(65 + (num % 26)) + result;
            num = Math.floor(num / 26);
        }
        return result.toLowerCase();
    }

    getPageNumberPosition(position, width, height, textWidth, _fontSize) {
        const margin = 40;
        const positions = {
            'top-left': { x: margin, y: height - margin },
            'top-center': { x: (width - textWidth) / 2, y: height - margin },
            'top-right': { x: width - textWidth - margin, y: height - margin },
            'bottom-left': { x: margin, y: margin },
            'bottom-center': { x: (width - textWidth) / 2, y: margin },
            'bottom-right': { x: width - textWidth - margin, y: margin }
        };
        return positions[position] || positions['bottom-center'];
    }

    // ==================== WATERMARK ====================

    /**
     * Add text watermark to PDF
     * @param {File} file - PDF file
     * @param {Object} options - Watermark options
     * @returns {Uint8Array} - Watermarked PDF bytes
     */
    async addTextWatermark(file, options = {}) {
        await this.ensureInit();

        const { PDFDocument, rgb, StandardFonts, degrees } = this.pdfLib;
        const arrayBuffer = await this.fileToArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

        const {
            text = 'WATERMARK',
            fontSize = 48,
            opacity = 0.3,
            rotation = -45,
            color = { r: 0.5, g: 0.5, b: 0.5 }
        } = options;

        // Filter text to only include WinAnsi-compatible characters
        const filteredText = this.filterSupportedText(text);

        const font = await pdf.embedFont(StandardFonts.HelveticaBold);
        const pages = pdf.getPages();

        pages.forEach(page => {
            const { width, height } = page.getSize();
            const textWidth = font.widthOfTextAtSize(filteredText, fontSize);

            page.drawText(filteredText, {
                x: (width - textWidth) / 2,
                y: height / 2,
                size: fontSize,
                font: font,
                color: rgb(color.r, color.g, color.b),
                opacity: opacity,
                rotate: degrees(rotation)
            });
        });

        return await pdf.save();
    }

    // ==================== REMOVE PAGES ====================

    /**
     * Remove pages from PDF
     * @param {File} file - PDF file
     * @param {number[]} pageNumbers - Pages to remove (1-indexed)
     * @returns {Uint8Array} - PDF with pages removed
     */
    async removePages(file, pageNumbers) {
        await this.ensureInit();

        const { PDFDocument } = this.pdfLib;
        const arrayBuffer = await this.fileToArrayBuffer(file);
        const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const newPdf = await PDFDocument.create();

        // Convert to 0-indexed set for fast lookup
        const removeSet = new Set(pageNumbers.map(n => n - 1));
        const keepIndices = [];

        for (let i = 0; i < sourcePdf.getPageCount(); i++) {
            if (!removeSet.has(i)) {
                keepIndices.push(i);
            }
        }

        if (keepIndices.length === 0) {
            throw new Error('Cannot remove all pages from PDF');
        }

        const pages = await newPdf.copyPages(sourcePdf, keepIndices);
        pages.forEach(page => newPdf.addPage(page));

        return await newPdf.save();
    }

    // ==================== PROTECT PDF ====================

    /**
     * Protect PDF with password
     * Note: PDF-lib doesn't support encryption directly, 
     * this is a placeholder for future implementation
     */
    async protectPDF(file, _options = {}) {
        await this.ensureInit();

        // PDF-lib doesn't support encryption natively
        // Return the file as-is with a warning
        console.warn('Password protection requires additional libraries. Returning unprotected PDF.');

        const arrayBuffer = await this.fileToArrayBuffer(file);
        return new Uint8Array(arrayBuffer);
    }

    // ==================== GET PDF INFO ====================

    /**
     * Get PDF information
     * @param {File} file - PDF file
     * @returns {Object} - PDF info
     */
    async getPDFInfo(file) {
        await this.ensureInit();

        const { PDFDocument } = this.pdfLib;
        const arrayBuffer = await this.fileToArrayBuffer(file);
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

        const pages = pdf.getPages();
        const firstPage = pages[0];

        return {
            pageCount: pdf.getPageCount(),
            title: pdf.getTitle() || null,
            author: pdf.getAuthor() || null,
            subject: pdf.getSubject() || null,
            creator: pdf.getCreator() || null,
            producer: pdf.getProducer() || null,
            creationDate: pdf.getCreationDate() || null,
            modificationDate: pdf.getModificationDate() || null,
            pageSize: firstPage ? {
                width: firstPage.getWidth(),
                height: firstPage.getHeight()
            } : null
        };
    }

    // ==================== UTILITIES ====================

    // Convert File to ArrayBuffer
    fileToArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
        });
    }

    // Create downloadable blob
    createDownloadBlob(bytes, filename) {
        const blob = new Blob([bytes], { type: 'application/pdf' });
        return {
            blob,
            url: URL.createObjectURL(blob),
            filename
        };
    }

    // Download file
    downloadFile(bytes, filename) {
        const { url, blob } = this.createDownloadBlob(bytes, filename);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();

        // Cleanup
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        return blob;
    }

    // Format file size
    formatSize(bytes) {
        if (!bytes) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
}

// Create and export singleton
const pdfProcessor = new PDFProcessor();

window.PDFProcessor = PDFProcessor;
window.pdfProcessor = pdfProcessor;

export default pdfProcessor;
export { PDFProcessor, pdfProcessor };
