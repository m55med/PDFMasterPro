// Watermark Tool Logic
import { pdfProcessor } from '../../lib/pdf-processor.js';
import { notifications } from '../../utils/notifications.js';

let currentFile = null;

document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('fileInput').click());

document.getElementById('fileInput').addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

document.getElementById('fontSize').addEventListener('input', (e) => {
    document.getElementById('sizeVal').textContent = e.target.value;
    // updatePreview(); // Assuming updatePreview is defined elsewhere or will be added
});

document.getElementById('wmOpacity').addEventListener('input', (e) => {
    document.getElementById('opVal').textContent = e.target.value + '%';
    // updatePreview(); 
});

// Color picker
document.querySelectorAll('.color-opt').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.color-opt').forEach(c => c.classList.remove('active'));
        opt.classList.add('active');
    });
});

document.getElementById('applyBtn').addEventListener('click', async () => {
    const btn = document.getElementById('applyBtn');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    try {
        const text = document.getElementById('wmText').value || 'WATERMARK';
        const fontSize = parseInt(document.getElementById('wmSize').value);
        const rotation = parseInt(document.getElementById('wmRotation').value);
        const opacity = parseInt(document.getElementById('wmOpacity').value) / 100;

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
    document.getElementById('saveBtn').disabled = false;
}
