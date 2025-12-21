// JPG to PDF Logic

import { pdfProcessor } from '../../../lib/pdf-processor.js';
import { storage } from '../../../utils/storage.js';
import { notifications } from '../../../utils/notifications.js';
import { i18n } from '../../../utils/i18n.js';

class ImageToPDF {
    constructor() {
        this.files = [];
        i18n.init();
        this.bindEvents();
    }

    bindEvents() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const convertBtn = document.getElementById('convertBtn');
        const addMoreBtn = document.getElementById('addMoreBtn');

        uploadArea.addEventListener('click', () => fileInput.click());
        addMoreBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
        convertBtn.addEventListener('click', () => this.convert());
    }

    handleFiles(fileList) {
        const newFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
        if (newFiles.length === 0) return;

        this.files = [...this.files, ...newFiles];
        this.render();
    }

    render() {
        const grid = document.getElementById('imageGrid');
        const uploadArea = document.getElementById('uploadArea');
        const settings = document.getElementById('settingsPanel');
        const convertBtn = document.getElementById('convertBtn');
        const addMoreBtn = document.getElementById('addMoreBtn');

        if (this.files.length > 0) {
            uploadArea.classList.add('hidden');
            grid.classList.remove('hidden');
            settings.classList.remove('hidden');
            convertBtn.disabled = false;
            addMoreBtn.disabled = false;

            // Render thumbnails
            grid.innerHTML = this.files.map((file, index) => {
                const url = URL.createObjectURL(file);
                return `
          <div class="image-card">
            <img src="${url}" onload="URL.revokeObjectURL(this.src)">
            <button class="remove-btn" data-index="${index}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        `;
            }).join('');

            // Attach remove handlers
            grid.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.remove(btn.dataset.index);
                });
            });
        } else {
            uploadArea.classList.remove('hidden');
            grid.classList.add('hidden');
            settings.classList.add('hidden');
            convertBtn.disabled = true;
            addMoreBtn.disabled = true;
        }
    }

    remove(index) {
        this.files.splice(index, 1);
        this.render();
    }

    async convert() {
        const btn = document.getElementById('convertBtn');
        const originalText = btn.textContent;
        btn.textContent = i18n.t('processing');
        btn.disabled = true;

        try {
            // Need to init PDF Lib
            await pdfProcessor.ensureInit();
            const { PDFDocument } = pdfProcessor.pdfLib;

            const doc = await PDFDocument.create();

            // Settings
            const pageSizeVal = document.getElementById('pageSize').value;
            const marginVal = document.getElementById('margin').value;

            let margin = 0;
            if (marginVal === 'small') margin = 28; // ~10mm points
            if (marginVal === 'large') margin = 56; // ~20mm points

            for (const file of this.files) {
                const arrayBuffer = await pdfProcessor.fileToArrayBuffer(file);
                let image;

                if (file.type === 'image/jpeg') {
                    image = await doc.embedJpg(arrayBuffer);
                } else {
                    image = await doc.embedPng(arrayBuffer);
                }

                const imgDims = image.scale(1);
                let page;

                if (pageSizeVal === 'fit') {
                    page = doc.addPage([imgDims.width + (margin * 2), imgDims.height + (margin * 2)]);
                    page.drawImage(image, {
                        x: margin,
                        y: margin,
                        width: imgDims.width,
                        height: imgDims.height,
                    });
                } else {
                    // A4 default
                    const A4 = [595.28, 841.89];
                    const dims = pageSizeVal === 'letter' ? [612, 792] : A4;

                    page = doc.addPage(dims);

                    // Fit image maintaining aspect ratio
                    const availWidth = dims[0] - (margin * 2);
                    const availHeight = dims[1] - (margin * 2);

                    const scale = Math.min(
                        availWidth / imgDims.width,
                        availHeight / imgDims.height
                    );

                    const drawWidth = imgDims.width * scale;
                    const drawHeight = imgDims.height * scale;

                    page.drawImage(image, {
                        x: (dims[0] - drawWidth) / 2,
                        y: (dims[1] - drawHeight) / 2,
                        width: drawWidth,
                        height: drawHeight
                    });
                }
            }

            const pdfBytes = await doc.save();
            const filename = 'images_to_pdf.pdf';

            // Download
            pdfProcessor.downloadFile(pdfBytes, filename);

            // Save to storage
            const resultId = await storage.saveFile(new File([pdfBytes], filename, { type: 'application/pdf' }));

            // Add to history
            await storage.addToHistory({
                id: resultId,
                fileName: filename,
                tool: 'jpg-to-pdf',
                size: pdfBytes.byteLength,
                status: 'success'
            });

            notifications.success(i18n.t('success'));

        } catch (error) {
            console.error(error);
            notifications.error(i18n.t('error') + ': ' + error.message);
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }
}

new ImageToPDF();
