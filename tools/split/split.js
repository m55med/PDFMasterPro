import { pdfProcessor } from '../../lib/pdf-processor.js';
import { notifications } from '../../utils/notifications.js';

// Set worker src
const pdfjsLib = window.pdfjsLib;
pdfjsLib.GlobalWorkerOptions.workerSrc = '../../lib/pdf.worker.min.js';

let currentFile = null;
let splitMode = 'ranges';
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

// Option cards
document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        splitMode = card.dataset.mode;

        const inputArea = document.getElementById('inputArea');
        const input = document.getElementById('rangeInput');

        if (splitMode === 'all') {
            inputArea.classList.add('hidden');
        } else {
            inputArea.classList.remove('hidden');
            input.placeholder = splitMode === 'ranges' ? 'e.g. 1-3, 5-7' : 'e.g. 2, 5, 12';
        }
    });
});

splitBtn.addEventListener('click', async () => {
    if (!currentFile) return;

    splitBtn.disabled = true;
    splitBtn.textContent = 'Processing...';

    try {
        let result;
        const input = document.getElementById('rangeInput').value;

        // Common logic: we might need to filter out excluded pages
        // But for specific logic:

        if (splitMode === 'all') {
            // Split all pages, respecting excluded pages
            result = await pdfProcessor.splitAllPages(currentFile, { excludedPages });

        } else if (splitMode === 'ranges') {
            // Parse ranges like "1-3, 5-7" and filter excluded pages
            const ranges = parseRanges(input);
            result = await pdfProcessor.splitByRanges(currentFile, ranges, { excludedPages });

        } else {
            // Extract specific pages
            let pages = parsePageNumbers(input);
            // Filter out excluded
            pages = pages.filter(p => !excludedPages.has(p));

            if (pages.length === 0) throw new Error('No pages selected to extract');

            const bytes = await pdfProcessor.extractPages(currentFile, pages);
            result = [{ name: `extracted_${currentFile.name}`, data: bytes }];
        }

        // Determine output
        if (result.length === 0) {
            notifications.warning('No pages generated (maybe all were deleted?)');
        } else if (result.length === 1) {
            pdfProcessor.downloadFile(result[0].data, result[0].name);
        } else if (result.length > 1) {
            // Max 5 for demo
            result.slice(0, 5).forEach(f => pdfProcessor.downloadFile(f.data, f.name));
            if (result.length > 5) notifications.info(`Downloaded 5 of ${result.length} files`);
        }

        notifications.success('Split successful');
    } catch (err) {
        console.error(err);
        notifications.error(err.message);
    } finally {
        splitBtn.disabled = false;
        splitBtn.textContent = 'Split PDF';
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

    document.getElementById('optionsPanel').classList.remove('hidden');
    document.getElementById('inputArea').classList.remove('hidden');
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

        // Limit preview for performance if too large
        const limit = Math.min(total, 50);

        for (let i = 1; i <= limit; i++) {
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 0.5 }); // Thumbnail size

            const canvas = document.createElement('canvas');
            canvas.className = 'page-thumb';
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // Render
            await page.render({
                canvasContext: canvas.getContext('2d'),
                viewport: viewport
            }).promise;

            // Wrapper
            const div = document.createElement('div');
            div.className = 'page-item';
            div.dataset.page = i;
            div.innerHTML = `
                <div class="page-number">${i}</div>
                <button class="delete-page-btn" title="Delete Page">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
            div.prepend(canvas); // Add canvas

            // Delete Event
            div.querySelector('.delete-page-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                togglePageDeletion(i, div);
            });

            container.appendChild(div);
        }

        if (total > limit) {
            const msg = document.createElement('p');
            msg.style.gridColumn = '1/-1';
            msg.style.textAlign = 'center';
            msg.style.color = '#64748B';
            msg.textContent = `Showing first ${limit} pages only`;
            container.appendChild(msg);
        }

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

// Helper parsers
function parseRanges(str) {
    // 1-3, 5-6
    return str.split(',').map(part => {
        const [start, end] = part.trim().split('-').map(Number);
        return { start, end: end || start };
    });
}

function parsePageNumbers(str) {
    return str.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
}
