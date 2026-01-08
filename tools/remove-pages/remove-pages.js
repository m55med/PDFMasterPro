// Remove Pages Tool
const { PDFDocument } = PDFLib;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const pagesGrid = document.getElementById('pagesGrid');
const removeBtn = document.getElementById('removeBtn');
const selectionInfo = document.getElementById('selectionInfo');
const selectedCount = document.getElementById('selectedCount');
const clearSelection = document.getElementById('clearSelection');

let pdfBytes = null;
let selectedPages = new Set();

// Set PDF.js worker
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

    uploadArea.classList.add('hidden');
    pagesGrid.classList.remove('hidden');
    pagesGrid.innerHTML = '';
    selectedPages.clear();
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
            <div class="delete-overlay">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
            </div>
        `;

        card.querySelector('.page-thumb').appendChild(canvas);
        pagesGrid.appendChild(card);
    }
}

function updateSelectionUI() {
    selectedCount.textContent = selectedPages.size;
    removeBtn.disabled = selectedPages.size === 0;

    if (selectedPages.size > 0) {
        selectionInfo.classList.add('active');
    } else {
        selectionInfo.classList.remove('active');
    }
}

clearSelection.addEventListener('click', () => {
    selectedPages.clear();
    document.querySelectorAll('.page-card').forEach(card => {
        card.classList.remove('selected');
    });
    updateSelectionUI();
});

removeBtn.addEventListener('click', async () => {
    if (selectedPages.size === 0 || !pdfBytes) return;

    try {
        const srcDoc = await PDFDocument.load(pdfBytes);
        const newDoc = await PDFDocument.create();

        const totalPages = srcDoc.getPageCount();
        const pagesToKeep = [];

        for (let i = 0; i < totalPages; i++) {
            if (!selectedPages.has(i + 1)) {
                pagesToKeep.push(i);
            }
        }

        if (pagesToKeep.length === 0) {
            alert('Cannot remove all pages. At least one page must remain.');
            return;
        }

        const copiedPages = await newDoc.copyPages(srcDoc, pagesToKeep);
        copiedPages.forEach(page => newDoc.addPage(page));

        const newPdfBytes = await newDoc.save();

        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pages-removed.pdf';
        a.click();
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error removing pages:', error);
        alert('Error removing pages: ' + error.message);
    }
});
