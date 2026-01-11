// Crop PDF Tool with Interactive Selection
const { PDFDocument } = PDFLib;

// Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const cropContainer = document.getElementById('cropContainer');
const previewCanvas = document.getElementById('previewCanvas');
const cropBtn = document.getElementById('cropBtn');
const cropOverlay = document.getElementById('cropOverlay');
const cropBox = document.getElementById('cropBox');
const cropInfo = document.getElementById('cropInfo');

const marginTop = document.getElementById('marginTop');
const marginBottom = document.getElementById('marginBottom');
const marginLeft = document.getElementById('marginLeft');
const marginRight = document.getElementById('marginRight');

const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

// Dim overlays
const dimTop = document.getElementById('dimTop');
const dimBottom = document.getElementById('dimBottom');
const dimLeft = document.getElementById('dimLeft');
const dimRight = document.getElementById('dimRight');

// State
let pdfBytes = null;
let pdfJsDoc = null;
let currentPage = 1;
let totalPages = 0;
let scale = 1;
let pageWidth = 0;
let pageHeight = 0;

// Crop box state (in pixels relative to canvas)
let cropRect = { x: 0, y: 0, width: 0, height: 0 };
let isDrawing = false;
let isDragging = false;
let isResizing = false;
let resizeHandle = null;
let startX = 0;
let startY = 0;
let startRect = null;

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '../../lib/pdf.worker.min.js';

// Upload events
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#2563EB';
    uploadArea.style.background = '#EFF6FF';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#E2E8F0';
    uploadArea.style.background = '';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#E2E8F0';
    uploadArea.style.background = '';
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

    uploadArea.classList.add('hidden');
    cropContainer.classList.remove('hidden');
    cropBtn.disabled = false;

    updatePageNav();
    await renderPage(currentPage);
    resetCropToFull();
}

async function renderPage(pageNum) {
    const page = await pdfJsDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });

    // Calculate scale to fit in preview area
    scale = Math.min(500 / viewport.width, 600 / viewport.height);
    const scaledViewport = page.getViewport({ scale });

    pageWidth = scaledViewport.width;
    pageHeight = scaledViewport.height;

    previewCanvas.width = pageWidth;
    previewCanvas.height = pageHeight;

    // Update overlay size
    cropOverlay.style.width = pageWidth + 'px';
    cropOverlay.style.height = pageHeight + 'px';

    await page.render({
        canvasContext: previewCanvas.getContext('2d'),
        viewport: scaledViewport
    }).promise;

    // Update crop box from margins
    updateCropFromMargins();
}

function resetCropToFull() {
    cropRect = { x: 0, y: 0, width: pageWidth, height: pageHeight };
    marginTop.value = 0;
    marginBottom.value = 0;
    marginLeft.value = 0;
    marginRight.value = 0;
    updateCropBox();

    // Reset preset buttons
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.preset-btn[data-margins="0,0,0,0"]')?.classList.add('active');
}

function updateCropBox() {
    cropBox.style.left = cropRect.x + 'px';
    cropBox.style.top = cropRect.y + 'px';
    cropBox.style.width = cropRect.width + 'px';
    cropBox.style.height = cropRect.height + 'px';

    // Update dim overlays
    dimTop.style.left = '0';
    dimTop.style.top = '0';
    dimTop.style.width = pageWidth + 'px';
    dimTop.style.height = cropRect.y + 'px';

    dimBottom.style.left = '0';
    dimBottom.style.top = (cropRect.y + cropRect.height) + 'px';
    dimBottom.style.width = pageWidth + 'px';
    dimBottom.style.height = (pageHeight - cropRect.y - cropRect.height) + 'px';

    dimLeft.style.left = '0';
    dimLeft.style.top = cropRect.y + 'px';
    dimLeft.style.width = cropRect.x + 'px';
    dimLeft.style.height = cropRect.height + 'px';

    dimRight.style.left = (cropRect.x + cropRect.width) + 'px';
    dimRight.style.top = cropRect.y + 'px';
    dimRight.style.width = (pageWidth - cropRect.x - cropRect.width) + 'px';
    dimRight.style.height = cropRect.height + 'px';

    // Update info display
    const widthMM = Math.round(cropRect.width / scale / 2.83465);
    const heightMM = Math.round(cropRect.height / scale / 2.83465);
    cropInfo.textContent = `${widthMM} x ${heightMM} mm`;
}

function updateCropFromMargins() {
    const mmToPixels = scale * 2.83465;
    const top = parseFloat(marginTop.value) * mmToPixels;
    const bottom = parseFloat(marginBottom.value) * mmToPixels;
    const left = parseFloat(marginLeft.value) * mmToPixels;
    const right = parseFloat(marginRight.value) * mmToPixels;

    cropRect = {
        x: left,
        y: top,
        width: Math.max(10, pageWidth - left - right),
        height: Math.max(10, pageHeight - top - bottom)
    };
    updateCropBox();
}

function updateMarginsFromCrop() {
    const pixelsToMM = 1 / (scale * 2.83465);
    marginTop.value = Math.round(cropRect.y * pixelsToMM);
    marginLeft.value = Math.round(cropRect.x * pixelsToMM);
    marginBottom.value = Math.round((pageHeight - cropRect.y - cropRect.height) * pixelsToMM);
    marginRight.value = Math.round((pageWidth - cropRect.x - cropRect.width) * pixelsToMM);

    // Deactivate presets
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
}

// Mouse events for crop overlay
cropOverlay.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('crop-handle')) {
        // Resize mode
        isResizing = true;
        resizeHandle = e.target.dataset.handle;
        startX = e.clientX;
        startY = e.clientY;
        startRect = { ...cropRect };
        e.preventDefault();
    } else if (e.target === cropBox || cropBox.contains(e.target)) {
        // Drag mode (move the box)
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startRect = { ...cropRect };
        cropOverlay.style.cursor = 'move';
        e.preventDefault();
    } else {
        // Draw new crop box
        isDrawing = true;
        const rect = cropOverlay.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        cropRect = { x: startX, y: startY, width: 0, height: 0 };
        e.preventDefault();
    }
});

document.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        const rect = cropOverlay.getBoundingClientRect();
        const currentX = Math.max(0, Math.min(pageWidth, e.clientX - rect.left));
        const currentY = Math.max(0, Math.min(pageHeight, e.clientY - rect.top));

        cropRect.x = Math.min(startX, currentX);
        cropRect.y = Math.min(startY, currentY);
        cropRect.width = Math.abs(currentX - startX);
        cropRect.height = Math.abs(currentY - startY);

        updateCropBox();
    } else if (isDragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        cropRect.x = Math.max(0, Math.min(pageWidth - startRect.width, startRect.x + dx));
        cropRect.y = Math.max(0, Math.min(pageHeight - startRect.height, startRect.y + dy));

        updateCropBox();
    } else if (isResizing) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newRect = { ...startRect };

        switch (resizeHandle) {
            case 'nw':
                newRect.x = Math.max(0, startRect.x + dx);
                newRect.y = Math.max(0, startRect.y + dy);
                newRect.width = startRect.width - dx;
                newRect.height = startRect.height - dy;
                break;
            case 'ne':
                newRect.y = Math.max(0, startRect.y + dy);
                newRect.width = startRect.width + dx;
                newRect.height = startRect.height - dy;
                break;
            case 'sw':
                newRect.x = Math.max(0, startRect.x + dx);
                newRect.width = startRect.width - dx;
                newRect.height = startRect.height + dy;
                break;
            case 'se':
                newRect.width = startRect.width + dx;
                newRect.height = startRect.height + dy;
                break;
            case 'n':
                newRect.y = Math.max(0, startRect.y + dy);
                newRect.height = startRect.height - dy;
                break;
            case 's':
                newRect.height = startRect.height + dy;
                break;
            case 'w':
                newRect.x = Math.max(0, startRect.x + dx);
                newRect.width = startRect.width - dx;
                break;
            case 'e':
                newRect.width = startRect.width + dx;
                break;
        }

        // Constrain to canvas
        newRect.width = Math.max(20, Math.min(pageWidth - newRect.x, newRect.width));
        newRect.height = Math.max(20, Math.min(pageHeight - newRect.y, newRect.height));

        cropRect = newRect;
        updateCropBox();
    }
});

document.addEventListener('mouseup', () => {
    if (isDrawing || isDragging || isResizing) {
        if (cropRect.width < 20 || cropRect.height < 20) {
            resetCropToFull();
        } else {
            updateMarginsFromCrop();
        }
    }
    isDrawing = false;
    isDragging = false;
    isResizing = false;
    cropOverlay.style.cursor = 'crosshair';
});

// Margin input events
[marginTop, marginBottom, marginLeft, marginRight].forEach(input => {
    input.addEventListener('input', () => {
        updateCropFromMargins();
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    });
});

// Preset buttons
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const margins = btn.dataset.margins.split(',').map(Number);
        marginTop.value = margins[0];
        marginBottom.value = margins[1];
        marginLeft.value = margins[2];
        marginRight.value = margins[3];
        updateCropFromMargins();
    });
});

// Reset button
document.getElementById('resetCrop')?.addEventListener('click', resetCropToFull);

// Page navigation
function updatePageNav() {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
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

// Apply crop
cropBtn.addEventListener('click', async () => {
    if (!pdfBytes) return;

    cropBtn.disabled = true;
    cropBtn.textContent = 'Processing...';

    try {
        const srcDoc = await PDFDocument.load(pdfBytes);
        const pages = srcDoc.getPages();

        const applyTo = document.getElementById('applyTo').value;

        // Convert mm to points (1mm = 2.83465 points)
        const mmToPoints = 2.83465;
        const cropTopPts = parseFloat(marginTop.value) * mmToPoints;
        const cropBottomPts = parseFloat(marginBottom.value) * mmToPoints;
        const cropLeftPts = parseFloat(marginLeft.value) * mmToPoints;
        const cropRightPts = parseFloat(marginRight.value) * mmToPoints;

        pages.forEach((page, index) => {
            const pageNum = index + 1;
            let shouldApply = false;

            if (applyTo === 'all') shouldApply = true;
            else if (applyTo === 'current' && pageNum === currentPage) shouldApply = true;
            else if (applyTo === 'odd' && pageNum % 2 === 1) shouldApply = true;
            else if (applyTo === 'even' && pageNum % 2 === 0) shouldApply = true;

            if (shouldApply) {
                const { width, height } = page.getSize();
                const newWidth = width - cropLeftPts - cropRightPts;
                const newHeight = height - cropTopPts - cropBottomPts;

                if (newWidth > 0 && newHeight > 0) {
                    page.setCropBox(
                        cropLeftPts,
                        cropBottomPts,
                        newWidth,
                        newHeight
                    );
                }
            }
        });

        const newPdfBytes = await srcDoc.save();

        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cropped.pdf';
        a.click();
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error cropping PDF:', error);
        alert('Error cropping PDF: ' + error.message);
    } finally {
        cropBtn.disabled = false;
        cropBtn.textContent = 'Apply Crop';
    }
});
