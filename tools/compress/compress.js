// Compress Tool Logic

import { pdfProcessor } from '../../lib/pdf-processor.js';
import { notifications } from '../../utils/notifications.js';

let currentFile = null;
let compressionLevel = 'medium';

// Init
document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('fileInput').click());

document.getElementById('fileInput').addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

// Level selection
document.querySelectorAll('.level-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.level-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        compressionLevel = card.dataset.level;
    });
});

// Compress action
document.getElementById('compressBtn').addEventListener('click', async () => {
    if (!currentFile) return;

    const btn = document.getElementById('compressBtn');
    btn.disabled = true;
    btn.textContent = 'Compressing...';

    document.getElementById('resultBox').style.display = 'none';

    try {
        const startTime = Date.now();
        const compressedBytes = await pdfProcessor.compressPDF(currentFile, compressionLevel);
        const duration = Date.now() - startTime;

        // Simulate processing time if too fast (for UX)
        if (duration < 500) await new Promise(r => setTimeout(r, 500));

        const newSize = compressedBytes.byteLength;
        const oldSize = currentFile.size;
        const ratio = ((oldSize - newSize) / oldSize * 100).toFixed(1);

        // Show results
        document.getElementById('resultBox').style.display = 'block';
        document.getElementById('origSize').textContent = pdfProcessor.formatSize(oldSize);
        document.getElementById('newSize').textContent = pdfProcessor.formatSize(newSize);
        document.getElementById('savedPercent').textContent = ratio > 0 ? ratio : '0';

        // Download
        const filename = `compressed_${currentFile.name}`;
        pdfProcessor.downloadFile(compressedBytes, filename);

        notifications.success(`Compressed successfully! Saved ${ratio}%`);

    } catch (err) {
        console.error(err);
        notifications.error('Compression failed: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Compress PDF';
    }
});

function handleFile(file) {
    if (file.type !== 'application/pdf') {
        notifications.error('Only PDF files are supported');
        return;
    }

    currentFile = file;

    document.getElementById('uploadArea').classList.add('hidden');
    document.getElementById('fileInfo').classList.remove('hidden');
    document.getElementById('fileInfo').innerHTML = `
    <div class="file-item">
      <div class="file-info">
        <div class="file-preview">PDF</div>
        <div>
          <div class="name">${file.name}</div>
          <div class="size" style="font-size: 12px; color: #64748B">${pdfProcessor.formatSize(file.size)}</div>
        </div>
      </div>
      <button class="remove-btn" id="resetBtn">Reset</button>
    </div>
  `;

    document.getElementById('levelSelector').classList.remove('hidden');
    document.getElementById('resetBtn').addEventListener('click', () => location.reload());
    document.getElementById('compressBtn').disabled = false;
}
