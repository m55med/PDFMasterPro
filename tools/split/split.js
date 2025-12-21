import { pdfProcessor } from '../../lib/pdf-processor.js';
import { storage } from '../../utils/storage.js';
import { notifications } from '../../utils/notifications.js';
import { i18n } from '../../utils/i18n.js';

// Set worker src
const pdfjsLib = window.pdfjsLib;
pdfjsLib.GlobalWorkerOptions.workerSrc = '../../lib/pdf.worker.min.js';

let currentFile = null;
let pdfDoc = null;
let excludedPages = new Set(); // 1-based page numbers

// Initialize
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const splitBtn = document.getElementById('splitBtn');

uploadArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
});


splitBtn.addEventListener('click', async () => {
    if (!currentFile) return;

    splitBtn.disabled = true;
    splitBtn.textContent = i18n.t('processing');

    try {
        // Get all page numbers (1-based)
        const totalPages = pdfDoc.numPages;
        const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);

        // Filter out excluded pages
        const pagesToKeep = allPages.filter(page => !excludedPages.has(page));

        if (pagesToKeep.length === 0) {
            notifications.warning('No pages left after deletion');
            return;
        }

        // Create new PDF with remaining pages
        const bytes = await pdfProcessor.extractPages(currentFile, pagesToKeep);
        const fileName = excludedPages.size > 0
            ? `split_${currentFile.name}`
            : `copy_${currentFile.name}`;

        // Save to storage so it shows up in "My Documents"
        const resultId = await storage.saveFile(new File([bytes], fileName, { type: 'application/pdf' }));

        // Add to history
        await storage.addToHistory({
            id: resultId,
            fileName: fileName,
            tool: 'split-pdf',
            size: bytes.byteLength,
            status: 'success'
        });

        pdfProcessor.downloadFile(bytes, fileName);
        notifications.success('PDF processed successfully');

    } catch (err) {
        console.error(err);
        notifications.error(err.message);
    } finally {
        splitBtn.disabled = false;
        splitBtn.textContent = i18n.t('split_pdf');
    }
});

async function handleFile(file) {
    if (file.type !== 'application/pdf') return;
    currentFile = file;
    excludedPages.clear();

    document.getElementById('uploadArea').classList.add('hidden');
    const fileInfo = document.getElementById('fileInfo');
    fileInfo.classList.remove('hidden');

    fileInfo.innerHTML = `
    <div class="file-item">
      <div class="file-info">
        <div class="file-preview">PDF</div>
        <div>${file.name}</div>
      </div>
      <button class="remove-btn" id="resetBtn">Reset</button>
    </div>
  `;

    document.getElementById('resetBtn').addEventListener('click', () => location.reload());

    document.getElementById('splitBtn').disabled = false;

    // Render Preview
    await renderPreview(file);
}

async function renderPreview(file) {
    const container = document.getElementById('previewContainer');
    container.classList.remove('hidden');
    container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#64748B">Loading preview...</p>';

    try {
        const arrayBuffer = await file.arrayBuffer();
        pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
        const total = pdfDoc.numPages;

        container.innerHTML = ''; // Clear loading

        // Show all pages (limit removed as requested)
        const limit = total;

        for (let i = 1; i <= limit; i++) {
            const page = await pdfDoc.getPage(i);

            // Calculate A4 ratio scale (210mm x 297mm = 1:1.414)
            // Larger size for better visibility
            const targetWidth = 400; // pixels for thumbnail - increased for better visibility
            const targetHeight = targetWidth * 1.414; // A4 ratio

            // Get original viewport to calculate scale
            const originalViewport = page.getViewport({ scale: 1.0 });
            const scale = targetWidth / originalViewport.width;
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            canvas.className = 'page-thumb';
            canvas.width = targetWidth;
            canvas.height = targetHeight;

            // Render
            await page.render({
                canvasContext: canvas.getContext('2d'),
                viewport: viewport
            }).promise;

            // Wrapper
            const div = document.createElement('div');
            div.className = 'page-item';
            div.dataset.page = i;

            // Create canvas wrapper
            const canvasWrapper = document.createElement('div');
            canvasWrapper.style.position = 'relative';
            canvasWrapper.appendChild(canvas);

            // Create info section
            const infoDiv = document.createElement('div');
            infoDiv.className = 'page-info';
            infoDiv.innerHTML = `
                <div class="page-title">${i18n.t('page_title', i)}</div>
                <div class="page-meta">${i18n.t('page_meta_size', Math.round(viewport.width), Math.round(viewport.height))}</div>
            `;

            // Create delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-page-btn';
            deleteBtn.title = i18n.t('delete_page');
            deleteBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            `;

            // Assemble the page item
            div.appendChild(canvasWrapper);
            div.appendChild(infoDiv);
            div.appendChild(deleteBtn);

            // Delete Event
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePageDeletion(i, div);
            });

            container.appendChild(div);
        }

        // No limit message needed if showing all pages


    } catch (err) {
        console.error('Preview error:', err);
        container.innerHTML = `<p style="color:red">Failed to load preview</p>`;
    }
}

function togglePageDeletion(pageNum, element) {
    if (excludedPages.has(pageNum)) {
        excludedPages.delete(pageNum);
        element.classList.remove('deleted');
    } else {
        excludedPages.add(pageNum);
        element.classList.add('deleted');
    }
}

