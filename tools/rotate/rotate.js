// Rotate Tool Logic

import { pdfProcessor } from '../../lib/pdf-processor.js';
import { notifications } from '../../utils/notifications.js';

let currentFile = null;
let currentRotation = 0;

document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('fileInput').click());

document.getElementById('fileInput').addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

document.getElementById('rotateLeft').addEventListener('click', () => rotate(-90));
document.getElementById('rotateRight').addEventListener('click', () => rotate(90));

document.getElementById('saveBtn').addEventListener('click', async () => {
    if (!currentFile) return;

    const btn = document.getElementById('saveBtn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        const rotatedBytes = await pdfProcessor.rotatePDF(currentFile, currentRotation);
        const filename = `rotated_${currentFile.name}`;

        pdfProcessor.downloadFile(rotatedBytes, filename);
        notifications.success('PDF rotated successfully');

    } catch (err) {
        console.error(err);
        notifications.error('Failed to save PDF');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save PDF';
    }
});

function handleFile(file) {
    if (file.type !== 'application/pdf') return;
    currentFile = file;

    document.getElementById('uploadArea').classList.add('hidden');
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

    document.getElementById('controls').classList.remove('hidden');
    document.getElementById('previewArea').classList.remove('hidden');
    document.getElementById('resetBtn').addEventListener('click', () => location.reload());
    document.getElementById('rotateLeft').disabled = false;
}

function rotate(deg) {
    currentRotation = (currentRotation + deg) % 360;
    const preview = document.getElementById('pagePreview');
    preview.style.transform = `rotate(${currentRotation}deg)`;
}
