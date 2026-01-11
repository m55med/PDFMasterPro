// Extract Pages Tool
const { PDFDocument } = PDFLib;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const pagesGrid = document.getElementById('pagesGrid');
const extractBtn = document.getElementById('extractBtn');
const selectionInfo = document.getElementById('selectionInfo');
const selectedCount = document.getElementById('selectedCount');
const clearSelection = document.getElementById('clearSelection');
const selectAll = document.getElementById('selectAll');

let pdfBytes = null;
let selectedPages = new Set();
let totalPages = 0;

pdfjsLib.GlobalWorkerOptions.workerSrc = '../../lib/pdf.worker.min.js';

// Event delegation for page cards
pagesGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.page-card');
    if (!card) return;

    const pageNum = parseInt(card.dataset.page);
    if (selectedPages.has(pageNum)) {
        selectedPages.delete(pageNum);
        card.classList.remove('selected');
    } else {
        selectedPages.add(pageNum);
        card.classList.add('selected');
    }
    updateSelectionUI();
});

uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#2563EB';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#E2E8F0';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#E2E8F0';
    if (e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
        handleFile(e.target.files[0]);
    }
});

async function handleFile(file) {
    pdfBytes = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    totalPages = pdf.numPages;

    uploadArea.classList.add('hidden');
    pagesGrid.classList.remove('hidden');
    pagesGrid.innerHTML = '';
    selectedPages.clear();
    selectionInfo.classList.add('active');
    updateSelectionUI();

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
            canvasContext: canvas.getContext('2d'),
            viewport: viewport
        }).promise;

        const card = document.createElement('div');
        card.className = 'page-card';
        card.dataset.page = i;
        card.innerHTML = `
            <div class="page-thumb"></div>
            <div class="page-number">Page ${i}</div>
        `;

        card.querySelector('.page-thumb').appendChild(canvas);
        pagesGrid.appendChild(card);
    }
}

function updateSelectionUI() {
    selectedCount.textContent = selectedPages.size;
    extractBtn.disabled = selectedPages.size === 0;
}

clearSelection.addEventListener('click', () => {
    selectedPages.clear();
    document.querySelectorAll('.page-card').forEach(card => {
        card.classList.remove('selected');
    });
    updateSelectionUI();
});

selectAll.addEventListener('click', () => {
    document.querySelectorAll('.page-card').forEach(card => {
        const pageNum = parseInt(card.dataset.page);
        selectedPages.add(pageNum);
        card.classList.add('selected');
    });
    updateSelectionUI();
});

extractBtn.addEventListener('click', async () => {
    if (selectedPages.size === 0 || !pdfBytes) return;

    try {
        const srcDoc = await PDFDocument.load(pdfBytes);
        const newDoc = await PDFDocument.create();

        const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
        const pageIndices = sortedPages.map(p => p - 1);

        const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
        copiedPages.forEach(page => newDoc.addPage(page));

        const newPdfBytes = await newDoc.save();

        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'extracted-pages.pdf';
        a.click();
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error extracting pages:', error);
        alert('Error extracting pages: ' + error.message);
    }
});
