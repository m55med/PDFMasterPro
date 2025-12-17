// OCR Tool Logic
import { notifications } from '../../utils/notifications.js';
import { pdfProcessor } from '../../lib/pdf-processor.js';

// Set worker src
pdfjsLib.GlobalWorkerOptions.workerSrc = '../../lib/pdf.worker.min.js';

let currentFile = null;

document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('fileInput').click());

document.getElementById('fileInput').addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

document.getElementById('startBtn').addEventListener('click', startOCR);
document.getElementById('downloadTxt').addEventListener('click', downloadText);
document.getElementById('copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(document.getElementById('resultText').value);
    notifications.success('Copied to clipboard');
});

function handleFile(file) {
    currentFile = file;

    document.getElementById('uploadArea').classList.add('hidden');
    const fileInfo = document.getElementById('fileInfo');
    fileInfo.classList.remove('hidden');
    fileInfo.innerHTML = `
    <div class="file-item">
      <div class="file-info">
        <div class="file-preview">${file.type.includes('pdf') ? 'PDF' : 'IMG'}</div>
        <div>${file.name}</div>
      </div>
      <button class="remove-btn" id="resetBtn">Reset</button>
    </div>
  `;

    document.getElementById('resetBtn').addEventListener('click', () => location.reload());

    document.getElementById('optionsPanel').classList.remove('hidden');
    document.getElementById('startBtn').disabled = false;
}

async function startOCR() {
    const btn = document.getElementById('startBtn');
    btn.disabled = true;
    document.getElementById('optionsPanel').classList.add('hidden');
    document.getElementById('progressBox').classList.remove('hidden');
    document.getElementById('resultArea').classList.add('hidden');

    try {
        const lang = document.getElementById('language').value;
        let images = [];

        // If PDF, convert to images first
        if (currentFile.type === 'application/pdf') {
            updateProgress('Converting PDF to images...', 10);
            const arrayBuffer = await pdfProcessor.fileToArrayBuffer(currentFile);
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

            // Limit pages for browser performance
            const maxPages = Math.min(pdf.numPages, 10);
            if (pdf.numPages > 10) notifications.warning('Processing first 10 pages only for performance');

            for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                images.push(canvas.toDataURL('image/png'));
            }
        } else {
            // Image file
            images.push(URL.createObjectURL(currentFile));
        }

        // Initialize worker with local paths
        updateProgress('Initializing OCR engine...', 20);
        const worker = await Tesseract.createWorker(lang, 1, {
            workerPath: '../../lib/worker.min.js',
            corePath: '../../lib/tesseract-core.wasm.js',
            logger: m => console.log(m)
        });

        let fullText = '';

        // Process each image
        for (let i = 0; i < images.length; i++) {
            updateProgress(`Scanning page ${i + 1} of ${images.length}...`, 30 + ((i / images.length) * 60));

            const ret = await worker.recognize(images[i]);
            fullText += `--- Page ${i + 1} ---\n${ret.data.text}\n\n`;
        }

        await worker.terminate();

        updateProgress('Done!', 100);

        // Show results
        document.getElementById('progressBox').classList.add('hidden');
        document.getElementById('resultArea').classList.remove('hidden');
        document.getElementById('resultText').value = fullText;

    } catch (err) {
        console.error(err);
        notifications.error('OCR failed: ' + err.message);
        document.getElementById('progressBox').classList.add('hidden');
        document.getElementById('optionsPanel').classList.remove('hidden');
    } finally {
        btn.disabled = false;
    }
}

function updateProgress(text, percent) {
    document.getElementById('progressStatus').textContent = text;
    document.getElementById('progressPercent').textContent = Math.round(percent) + '%';
    document.getElementById('progressBar').style.width = percent + '%';
}

function downloadText() {
    const text = document.getElementById('resultText').value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocr_result_${currentFile.name}.txt`;
    link.click();
}
