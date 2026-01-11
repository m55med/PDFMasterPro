// Redact PDF Tool
const { PDFDocument, rgb } = PDFLib;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const redactContainer = document.getElementById('redactContainer');
const previewCanvas = document.getElementById('previewCanvas');
const redactOverlay = document.getElementById('redactOverlay');
const applyBtn = document.getElementById('applyBtn');
const boxCount = document.getElementById('boxCount');
const clearBoxes = document.getElementById('clearBoxes');

const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

let pdfBytes = null;
let pdfJsDoc = null;
let currentPage = 1;
let totalPages = 0;
let scale = 1;

// Store redactions per page: { pageNum: [{x, y, width, height}, ...] }
let redactions = {};
let currentColor = [0, 0, 0];

let isDrawing = false;
let startX, startY, currentBox;

pdfjsLib.GlobalWorkerOptions.workerSrc = '../../lib/pdf.worker.min.js';

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
    pdfJsDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    totalPages = pdfJsDoc.numPages;
    currentPage = 1;
    redactions = {};

    uploadArea.classList.add('hidden');
    redactContainer.classList.remove('hidden');
    applyBtn.disabled = false;

    updatePageNav();
    await renderPage(currentPage);
}

async function renderPage(pageNum) {
    const page = await pdfJsDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });

    scale = Math.min(600 / viewport.width, 700 / viewport.height);
    const scaledViewport = page.getViewport({ scale });

    previewCanvas.width = scaledViewport.width;
    previewCanvas.height = scaledViewport.height;

    await page.render({
        canvasContext: previewCanvas.getContext('2d'),
        viewport: scaledViewport
    }).promise;

    // Update overlay size
    redactOverlay.style.width = scaledViewport.width + 'px';
    redactOverlay.style.height = scaledViewport.height + 'px';

    // Render existing redaction boxes for this page
    renderRedactionBoxes();
}

function renderRedactionBoxes() {
    // Clear existing boxes
    redactOverlay.querySelectorAll('.redact-box').forEach(b => b.remove());

    const pageRedactions = redactions[currentPage] || [];
    pageRedactions.forEach((rect, index) => {
        createBoxElement(rect, index);
    });

    boxCount.textContent = pageRedactions.length;
}

function createBoxElement(rect, index) {
    const box = document.createElement('div');
    box.className = 'redact-box';
    box.style.left = rect.x + 'px';
    box.style.top = rect.y + 'px';
    box.style.width = rect.width + 'px';
    box.style.height = rect.height + 'px';
    box.style.background = `rgba(${rect.color.join(',')}, 0.8)`;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'x';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        redactions[currentPage].splice(index, 1);
        renderRedactionBoxes();
    };
    box.appendChild(deleteBtn);

    redactOverlay.appendChild(box);
}

// Drawing functionality
redactOverlay.addEventListener('mousedown', (e) => {
    if (e.target !== redactOverlay) return;

    isDrawing = true;
    const rect = redactOverlay.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    currentBox = document.createElement('div');
    currentBox.className = 'redact-box';
    currentBox.style.left = startX + 'px';
    currentBox.style.top = startY + 'px';
    currentBox.style.background = `rgba(${currentColor.join(',')}, 0.8)`;
    redactOverlay.appendChild(currentBox);
});

redactOverlay.addEventListener('mousemove', (e) => {
    if (!isDrawing || !currentBox) return;

    const rect = redactOverlay.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const width = currentX - startX;
    const height = currentY - startY;

    if (width > 0) {
        currentBox.style.width = width + 'px';
    } else {
        currentBox.style.left = currentX + 'px';
        currentBox.style.width = -width + 'px';
    }

    if (height > 0) {
        currentBox.style.height = height + 'px';
    } else {
        currentBox.style.top = currentY + 'px';
        currentBox.style.height = -height + 'px';
    }
});

redactOverlay.addEventListener('mouseup', () => {
    if (!isDrawing || !currentBox) return;
    isDrawing = false;

    const boxRect = {
        x: parseInt(currentBox.style.left),
        y: parseInt(currentBox.style.top),
        width: parseInt(currentBox.style.width) || 0,
        height: parseInt(currentBox.style.height) || 0,
        color: [...currentColor]
    };

    // Only save if box has meaningful size
    if (boxRect.width > 5 && boxRect.height > 5) {
        if (!redactions[currentPage]) redactions[currentPage] = [];
        redactions[currentPage].push(boxRect);
    }

    currentBox = null;
    renderRedactionBoxes();
});

// Color selection
document.querySelectorAll('.color-opt').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.color-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        currentColor = opt.dataset.color.split(',').map(Number);
    });
});

// Clear boxes
clearBoxes.addEventListener('click', () => {
    redactions[currentPage] = [];
    renderRedactionBoxes();
});

// Page navigation
function updatePageNav() {
    pageInfo.textContent = `${currentPage} / ${totalPages}`;
    prevPage.disabled = currentPage <= 1;
    nextPage.disabled = currentPage >= totalPages;
}

prevPage.addEventListener('click', async () => {
    if (currentPage > 1) {
        currentPage--;
        updatePageNav();
        await renderPage(currentPage);
    }
});

nextPage.addEventListener('click', async () => {
    if (currentPage < totalPages) {
        currentPage++;
        updatePageNav();
        await renderPage(currentPage);
    }
});

// Apply redactions
applyBtn.addEventListener('click', async () => {
    if (!pdfBytes) return;

    try {
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        const currentScale = scale; // Capture scale value

        for (const [pageNum, boxes] of Object.entries(redactions)) {
            const page = pages[parseInt(pageNum) - 1];
            const { height } = page.getSize();

            for (const box of boxes) {
                // Convert screen coordinates to PDF coordinates
                const pdfX = box.x / currentScale;
                const pdfY = height - (box.y / currentScale) - (box.height / currentScale);
                const pdfWidth = box.width / currentScale;
                const pdfHeight = box.height / currentScale;

                page.drawRectangle({
                    x: pdfX,
                    y: pdfY,
                    width: pdfWidth,
                    height: pdfHeight,
                    color: rgb(box.color[0] / 255, box.color[1] / 255, box.color[2] / 255),
                });
            }
        }

        const newPdfBytes = await pdfDoc.save();

        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'redacted.pdf';
        a.click();
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error applying redactions:', error);
        alert('Error: ' + error.message);
    }
});
