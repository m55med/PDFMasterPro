// Watermark Tool Logic with Live Preview
import { pdfProcessor } from '../../lib/pdf-processor.js';
import { notifications } from '../../utils/notifications.js';

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '../../lib/pdf.worker.min.js';

let currentFile = null;
let pdfDoc = null;

// Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewCanvas = document.getElementById('previewCanvas');
const watermarkOverlay = document.getElementById('watermarkOverlay');
const wmText = document.getElementById('wmText');
const wmSize = document.getElementById('wmSize');
const wmRotation = document.getElementById('wmRotation');
const wmOpacity = document.getElementById('wmOpacity');
const sizeValSpan = document.getElementById('sizeVal');
const opValSpan = document.getElementById('opVal');

// Upload handlers
uploadArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#2563EB';
    uploadArea.style.background = '#EFF6FF';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#E2E8F0';
    uploadArea.style.background = 'white';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#E2E8F0';
    uploadArea.style.background = 'white';
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        handleFile(file);
    }
});

// Settings change handlers - update preview
wmText.addEventListener('input', updatePreview);
wmSize.addEventListener('input', (e) => {
    sizeValSpan.textContent = e.target.value;
    updatePreview();
});
wmRotation.addEventListener('change', updatePreview);
wmOpacity.addEventListener('input', (e) => {
    opValSpan.textContent = e.target.value + '%';
    updatePreview();
});

// Color picker
document.querySelectorAll('.color-opt').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.color-opt').forEach(c => c.classList.remove('active'));
        opt.classList.add('active');
        updatePreview();
    });
});

// Check if text contains non-Latin characters
function hasNonLatinChars(text) {
    for (const char of text) {
        const code = char.charCodeAt(0);
        if (!((code >= 0x0020 && code <= 0x007E) || (code >= 0x00A0 && code <= 0x00FF))) {
            if (char !== '\n' && char !== '\r' && char !== '\t') {
                return true;
            }
        }
    }
    return false;
}

// Apply button
document.getElementById('applyBtn').addEventListener('click', async () => {
    const btn = document.getElementById('applyBtn');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    try {
        const text = wmText.value || 'WATERMARK';
        const fontSize = parseInt(wmSize.value);
        const rotation = parseInt(wmRotation.value);
        const opacity = parseInt(wmOpacity.value) / 100;

        // Warn about non-Latin characters
        if (hasNonLatinChars(text)) {
            notifications.warning('Arabic/non-Latin characters are not supported. Only English text will be used.');
        }

        const colorOpt = document.querySelector('.color-opt.active');
        const color = {
            r: parseFloat(colorOpt.dataset.r),
            g: parseFloat(colorOpt.dataset.g),
            b: parseFloat(colorOpt.dataset.b)
        };

        const watermarkedBytes = await pdfProcessor.addTextWatermark(currentFile, {
            text,
            fontSize,
            rotation,
            opacity,
            color
        });

        pdfProcessor.downloadFile(watermarkedBytes, `watermarked_${currentFile.name}`);
        notifications.success('Watermark added successfully');

    } catch (err) {
        console.error(err);
        notifications.error('Failed: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Apply Watermark';
    }
});

async function handleFile(file) {
    if (file.type !== 'application/pdf') return;
    currentFile = file;

    uploadArea.classList.add('hidden');
    document.getElementById('fileInfo').classList.remove('hidden');
    document.getElementById('fileInfo').innerHTML = `
    <div class="file-item">
      <div class="file-info">
        <div class="file-preview">PDF</div>
        <div>${file.name}</div>
      </div>
      <button class="remove-btn" id="resetBtn">Reset</button>
    </div>
  `;

    document.getElementById('settingsPanel').classList.remove('hidden');
    document.getElementById('resetBtn').addEventListener('click', () => location.reload());
    document.getElementById('applyBtn').disabled = false;

    // Load PDF for preview
    try {
        const arrayBuffer = await file.arrayBuffer();
        pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        await renderPreview();
        updatePreview();
    } catch (err) {
        console.error('Error loading PDF preview:', err);
    }
}

async function renderPreview() {
    if (!pdfDoc) return;

    try {
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });

        // Scale to fit preview container
        const maxHeight = 320;
        const scale = maxHeight / viewport.height;
        const scaledViewport = page.getViewport({ scale });

        previewCanvas.width = scaledViewport.width;
        previewCanvas.height = scaledViewport.height;

        const context = previewCanvas.getContext('2d');
        context.fillStyle = 'white';
        context.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

        await page.render({
            canvasContext: context,
            viewport: scaledViewport
        }).promise;

    } catch (err) {
        console.error('Error rendering preview:', err);
    }
}

function updatePreview() {
    if (!watermarkOverlay) return;

    const text = wmText.value || 'WATERMARK';
    const fontSize = parseInt(wmSize.value) * 0.5; // Scale down for preview
    const rotation = parseInt(wmRotation.value);
    const opacity = parseInt(wmOpacity.value) / 100;

    const colorOpt = document.querySelector('.color-opt.active');
    const r = Math.round(parseFloat(colorOpt.dataset.r) * 255);
    const g = Math.round(parseFloat(colorOpt.dataset.g) * 255);
    const b = Math.round(parseFloat(colorOpt.dataset.b) * 255);

    watermarkOverlay.textContent = text;
    watermarkOverlay.style.fontSize = `${fontSize}px`;
    watermarkOverlay.style.transform = `rotate(${rotation}deg)`;
    watermarkOverlay.style.opacity = opacity;
    watermarkOverlay.style.color = `rgb(${r}, ${g}, ${b})`;
}
