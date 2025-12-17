// Page Numbers Logic
import { pdfProcessor } from '../../lib/pdf-processor.js';
import { notifications } from '../../utils/notifications.js';

let currentFile = null;
let position = 'bottom-center';

document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('fileInput').click());

document.getElementById('fileInput').addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

// Position selection
document.querySelectorAll('.pos-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        position = btn.dataset.pos;
    });
});

document.getElementById('applyBtn').addEventListener('click', async () => {
    const btn = document.getElementById('applyBtn');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    try {
        const format = document.getElementById('format').value;
        const startFrom = parseInt(document.getElementById('startFrom').value) || 1;

        const bytes = await pdfProcessor.addPageNumbers(currentFile, {
            position,
            format,
            startFrom,
            fontSize: 10
        });

        pdfProcessor.downloadFile(bytes, `numbered_${currentFile.name}`);
        notifications.success('Page numbers added');

    } catch (err) {
        console.error(err);
        notifications.error('Failed: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Add Numbers';
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

    document.getElementById('settingsPanel').classList.remove('hidden');
    document.getElementById('resetBtn').addEventListener('click', () => location.reload());
    document.getElementById('applyBtn').disabled = false;
}
