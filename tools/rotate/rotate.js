// Rotate Tool Logic - Individual Page Rotation with Preview

import { pdfProcessor } from '../../lib/pdf-processor.js';
import { storage } from '../../utils/storage.js';
import { notifications } from '../../utils/notifications.js';

// Set worker src for pdf.js
const pdfjsLib = window.pdfjsLib;
pdfjsLib.GlobalWorkerOptions.workerSrc = '../../lib/pdf.worker.min.js';

let currentFile = null;
let pdfDoc = null;
let pageRotations = {}; // Store rotation for each page: { 1: 90, 2: 0, 3: 180, ... }

// Initialize elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const controls = document.getElementById('controls');
const pagesGrid = document.getElementById('pagesGrid');
const saveBtn = document.getElementById('saveBtn');

// Event listeners
uploadArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

// Rotate all pages buttons
document.getElementById('rotateAllLeft').addEventListener('click', () => rotateAllPages(-90));
document.getElementById('rotateAllRight').addEventListener('click', () => rotateAllPages(90));
document.getElementById('rotateAll180').addEventListener('click', () => rotateAllPages(180));
document.getElementById('resetAll').addEventListener('click', resetAllRotations);

// Save button
saveBtn.addEventListener('click', async () => {
    if (!currentFile) return;

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
        const rotatedBytes = await pdfProcessor.rotatePDFPerPage(currentFile, pageRotations);
        const filename = `rotated_${currentFile.name}`;

        // Save to storage so it shows up in "My Documents"
        const resultId = await storage.saveFile(new File([rotatedBytes], filename, { type: 'application/pdf' }));

        // Add to history
        await storage.addToHistory({
            id: resultId,
            fileName: filename,
            tool: 'rotate-pdf',
            size: rotatedBytes.byteLength,
            status: 'success'
        });

        pdfProcessor.downloadFile(rotatedBytes, filename);
        notifications.success('PDF rotated successfully');

    } catch (err) {
        console.error(err);
        notifications.error('Failed to save PDF');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save PDF';
    }
});

async function handleFile(file) {
    if (file.type !== 'application/pdf') return;
    currentFile = file;
    pageRotations = {};

    uploadArea.classList.add('hidden');
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

    controls.classList.remove('hidden');
    saveBtn.disabled = false;

    // Render all pages
    await renderAllPages(file);
}

async function renderAllPages(file) {
    pagesGrid.classList.remove('hidden');
    pagesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#64748B">Loading pages...</p>';

    try {
        const arrayBuffer = await file.arrayBuffer();
        pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
        const totalPages = pdfDoc.numPages;

        pagesGrid.innerHTML = '';

        // Initialize rotations
        for (let i = 1; i <= totalPages; i++) {
            pageRotations[i] = 0;
        }

        // Render each page
        for (let i = 1; i <= totalPages; i++) {
            const page = await pdfDoc.getPage(i);

            // Calculate thumbnail size
            const targetWidth = 180;
            const originalViewport = page.getViewport({ scale: 1.0 });
            const scale = targetWidth / originalViewport.width;
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            canvas.className = 'page-thumb';
            canvas.width = targetWidth;
            canvas.height = viewport.height;
            canvas.dataset.page = i;

            // Render page to canvas
            await page.render({
                canvasContext: canvas.getContext('2d'),
                viewport: viewport
            }).promise;

            // Create page item container
            const pageItem = document.createElement('div');
            pageItem.className = 'page-item';
            pageItem.dataset.page = i;

            // Thumbnail wrapper
            const thumbWrapper = document.createElement('div');
            thumbWrapper.className = 'page-thumb-wrapper';

            // Rotation badge
            const badge = document.createElement('div');
            badge.className = 'rotation-badge';
            badge.id = `badge-${i}`;
            badge.textContent = '0°';

            thumbWrapper.appendChild(canvas);
            thumbWrapper.appendChild(badge);

            // Controls for this page
            const pageControls = document.createElement('div');
            pageControls.className = 'page-controls';
            pageControls.innerHTML = `
                <button class="page-rotate-btn" data-action="left" data-page="${i}" title="Rotate Left -90°">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                    </svg>
                </button>
                <span class="page-number">Page ${i}</span>
                <button class="page-rotate-btn" data-action="right" data-page="${i}" title="Rotate Right +90°">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                    </svg>
                </button>
            `;

            pageItem.appendChild(thumbWrapper);
            pageItem.appendChild(pageControls);
            pagesGrid.appendChild(pageItem);
        }

        // Event delegation for rotation buttons
        pagesGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.page-rotate-btn');
            if (!btn) return;

            const pageNum = parseInt(btn.dataset.page);
            const action = btn.dataset.action;

            if (action === 'left') {
                rotatePage(pageNum, -90);
            } else if (action === 'right') {
                rotatePage(pageNum, 90);
            }
        });

    } catch (err) {
        console.error('Preview error:', err);
        pagesGrid.innerHTML = `<p style="color:red; grid-column: 1/-1; text-align:center;">Failed to load preview</p>`;
    }
}

function rotatePage(pageNum, degrees) {
    // Update rotation (normalize to 0, 90, 180, 270)
    pageRotations[pageNum] = ((pageRotations[pageNum] + degrees) % 360 + 360) % 360;

    // Update visual preview
    const canvas = pagesGrid.querySelector(`canvas[data-page="${pageNum}"]`);
    if (canvas) {
        canvas.style.transform = `rotate(${pageRotations[pageNum]}deg)`;
    }

    // Update badge
    updateBadge(pageNum);
}

function rotateAllPages(degrees) {
    const totalPages = Object.keys(pageRotations).length;

    for (let i = 1; i <= totalPages; i++) {
        pageRotations[i] = ((pageRotations[i] + degrees) % 360 + 360) % 360;

        // Update visual preview
        const canvas = pagesGrid.querySelector(`canvas[data-page="${i}"]`);
        if (canvas) {
            canvas.style.transform = `rotate(${pageRotations[i]}deg)`;
        }

        updateBadge(i);
    }
}

function resetAllRotations() {
    const totalPages = Object.keys(pageRotations).length;

    for (let i = 1; i <= totalPages; i++) {
        pageRotations[i] = 0;

        // Reset visual preview
        const canvas = pagesGrid.querySelector(`canvas[data-page="${i}"]`);
        if (canvas) {
            canvas.style.transform = 'rotate(0deg)';
        }

        updateBadge(i);
    }
}

function updateBadge(pageNum) {
    const badge = document.getElementById(`badge-${pageNum}`);
    if (badge) {
        const rotation = pageRotations[pageNum];
        badge.textContent = `${rotation}°`;

        if (rotation !== 0) {
            badge.classList.add('visible');
        } else {
            badge.classList.remove('visible');
        }
    }
}
