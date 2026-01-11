// Sign PDF Tool
const { PDFDocument } = PDFLib;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const signContainer = document.getElementById('signContainer');
const previewCanvas = document.getElementById('previewCanvas');
const signatureOverlay = document.getElementById('signatureOverlay');
const saveBtn = document.getElementById('saveBtn');

const signaturePad = document.getElementById('signaturePad');
const clearPad = document.getElementById('clearPad');
const useSig = document.getElementById('useSig');
const sigUpload = document.getElementById('sigUpload');

const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

let pdfBytes = null;
let pdfJsDoc = null;
let currentPage = 1;
let totalPages = 0;
let scale = 1;

let currentSignature = null;
let placedSignatures = {}; // {pageNum: [{x, y, dataUrl}, ...]}

let isDrawing = false;
let padCtx = null;
let lastX = 0;
let lastY = 0;

pdfjsLib.GlobalWorkerOptions.workerSrc = '../../lib/pdf.worker.min.js';

// Initialize signature pad with fixed dimensions
function initSignaturePad() {
    // Use fixed dimensions since parent might be hidden initially
    const padWidth = 260;
    const padHeight = 150;

    signaturePad.width = padWidth;
    signaturePad.height = padHeight;

    padCtx = signaturePad.getContext('2d');
    padCtx.strokeStyle = '#000';
    padCtx.lineWidth = 2;
    padCtx.lineCap = 'round';
    padCtx.lineJoin = 'round';
    padCtx.fillStyle = '#FAFAFA';
    padCtx.fillRect(0, 0, padWidth, padHeight);
}

// Get correct coordinates for drawing
function getCoordinates(e) {
    const rect = signaturePad.getBoundingClientRect();
    const scaleX = signaturePad.width / rect.width;
    const scaleY = signaturePad.height / rect.height;

    if (e.touches) {
        return {
            x: (e.touches[0].clientX - rect.left) * scaleX,
            y: (e.touches[0].clientY - rect.top) * scaleY
        };
    }
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

// Drawing on signature pad - Mouse events
signaturePad.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const coords = getCoordinates(e);
    lastX = coords.x;
    lastY = coords.y;
    padCtx.beginPath();
    padCtx.moveTo(lastX, lastY);
});

signaturePad.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    padCtx.lineTo(coords.x, coords.y);
    padCtx.stroke();
    padCtx.beginPath();
    padCtx.moveTo(coords.x, coords.y);
    lastX = coords.x;
    lastY = coords.y;
});

signaturePad.addEventListener('mouseup', () => {
    isDrawing = false;
    padCtx.beginPath();
});

signaturePad.addEventListener('mouseleave', () => {
    isDrawing = false;
    padCtx.beginPath();
});

// Touch support
signaturePad.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    const coords = getCoordinates(e);
    lastX = coords.x;
    lastY = coords.y;
    padCtx.beginPath();
    padCtx.moveTo(lastX, lastY);
}, { passive: false });

signaturePad.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    padCtx.lineTo(coords.x, coords.y);
    padCtx.stroke();
    padCtx.beginPath();
    padCtx.moveTo(coords.x, coords.y);
    lastX = coords.x;
    lastY = coords.y;
}, { passive: false });

signaturePad.addEventListener('touchend', (e) => {
    e.preventDefault();
    isDrawing = false;
    padCtx.beginPath();
});

clearPad.addEventListener('click', () => {
    padCtx.fillStyle = '#FAFAFA';
    padCtx.fillRect(0, 0, signaturePad.width, signaturePad.height);
    padCtx.strokeStyle = '#000';
});

useSig.addEventListener('click', () => {
    // Create a temporary canvas to extract only the signature (remove background)
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = signaturePad.width;
    tempCanvas.height = signaturePad.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw the signature with transparent background
    tempCtx.drawImage(signaturePad, 0, 0);

    // Get image data and make background transparent
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        // If pixel is close to background color (#FAFAFA = 250, 250, 250)
        if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
            data[i + 3] = 0; // Make transparent
        }
    }

    tempCtx.putImageData(imageData, 0, 0);
    currentSignature = tempCanvas.toDataURL('image/png');

    alert('Signature ready! Click on the PDF to place it.');
});

// Upload signature image
sigUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        currentSignature = event.target.result;
        alert('Signature uploaded! Click on the PDF to place it.');
    };
    reader.readAsDataURL(file);
});

// PDF upload
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
    placedSignatures = {};

    uploadArea.classList.add('hidden');
    signContainer.classList.remove('hidden');
    saveBtn.disabled = false;

    // Initialize signature pad after container is visible
    setTimeout(() => {
        initSignaturePad();
    }, 100);

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

    signatureOverlay.style.width = scaledViewport.width + 'px';
    signatureOverlay.style.height = scaledViewport.height + 'px';

    renderPlacedSignatures();
}

function renderPlacedSignatures() {
    signatureOverlay.querySelectorAll('.placed-signature').forEach(s => s.remove());

    const sigs = placedSignatures[currentPage] || [];
    sigs.forEach((sig, index) => {
        createSignatureElement(sig, index);
    });
}

function createSignatureElement(sig, index) {
    const div = document.createElement('div');
    div.className = 'placed-signature';
    div.style.left = sig.x + 'px';
    div.style.top = sig.y + 'px';

    const img = document.createElement('img');
    img.src = sig.dataUrl;
    div.appendChild(img);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'x';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        placedSignatures[currentPage].splice(index, 1);
        renderPlacedSignatures();
    };
    div.appendChild(deleteBtn);

    // Make draggable
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    div.addEventListener('mousedown', (e) => {
        if (e.target === deleteBtn) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = div.offsetLeft;
        initialTop = div.offsetTop;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        div.style.left = (initialLeft + dx) + 'px';
        div.style.top = (initialTop + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            sig.x = parseInt(div.style.left);
            sig.y = parseInt(div.style.top);
        }
        isDragging = false;
    });

    signatureOverlay.appendChild(div);
}

// Click to place signature
signatureOverlay.addEventListener('click', (e) => {
    if (!currentSignature) {
        alert('Please draw or upload a signature first');
        return;
    }
    if (e.target !== signatureOverlay) return;

    const rect = signatureOverlay.getBoundingClientRect();
    const x = e.clientX - rect.left - 50;
    const y = e.clientY - rect.top - 20;

    if (!placedSignatures[currentPage]) placedSignatures[currentPage] = [];
    placedSignatures[currentPage].push({ x, y, dataUrl: currentSignature });

    renderPlacedSignatures();
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

// Save PDF
saveBtn.addEventListener('click', async () => {
    if (!pdfBytes) return;

    try {
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();

        for (const [pageNum, sigs] of Object.entries(placedSignatures)) {
            const page = pages[parseInt(pageNum) - 1];
            const { height } = page.getSize();

            for (const sig of sigs) {
                const pngImage = await pdfDoc.embedPng(sig.dataUrl);
                const imgDims = pngImage.scale(0.5);

                const pdfX = sig.x / scale;
                const pdfY = height - (sig.y / scale) - (imgDims.height);

                page.drawImage(pngImage, {
                    x: pdfX,
                    y: pdfY,
                    width: imgDims.width,
                    height: imgDims.height,
                });
            }
        }

        const newPdfBytes = await pdfDoc.save();

        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'signed.pdf';
        a.click();
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error saving signed PDF:', error);
        alert('Error: ' + error.message);
    }
});

// Initialize pad on load (will be re-initialized when file is loaded)
initSignaturePad();
