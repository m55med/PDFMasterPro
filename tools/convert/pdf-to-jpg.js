// PDF to JPG Logic

import { notifications } from '../../utils/notifications.js';
import { pdfProcessor } from '../../lib/pdf-processor.js';
import { storage } from '../../utils/storage.js';
import { i18n } from '../../utils/i18n.js';

// Set worker src
pdfjsLib.GlobalWorkerOptions.workerSrc = '../../lib/pdf.worker.min.js';

let currentFile = null;

// Initialize i18n
i18n.init();

document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('fileInput').click());

document.getElementById('fileInput').addEventListener('change', (e) => {
  if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

document.getElementById('convertBtn').addEventListener('click', convert);

function handleFile(file) {
  if (file.type !== 'application/pdf') return;
  currentFile = file;

  document.getElementById('uploadArea').classList.add('hidden');
  const fileInfo = document.getElementById('fileInfo');
  fileInfo.classList.remove('hidden');
  fileInfo.innerHTML = `
    <div class="file-item">
      <div class="file-info">
        <div class="file-preview">PDF</div>
        <div>${file.name}</div>
      </div>
      <button class="remove-btn" id="resetBtn">Reset</button>
    </div>
  `;

  document.getElementById('resetBtn').addEventListener('click', () => location.reload());
  document.getElementById('convertBtn').disabled = false;
}

async function convert() {
  if (!currentFile) return;

  const btn = document.getElementById('convertBtn');
  btn.disabled = true;
  document.getElementById('statusArea').classList.remove('hidden');
  document.getElementById('statusText').textContent = i18n.t('processing');

  try {
    const arrayBuffer = await pdfProcessor.fileToArrayBuffer(currentFile);
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

    // Process pages one by one
    // Note: Creating a ZIP would be best but simple approach is to download individually for now
    // Or just 1 big action. Let's do first 10 pages for MVP safety

    const count = pdf.numPages;
    document.getElementById('statusText').textContent = `Processing ${count} pages...`;

    // We can't actually download multiple files easily without zip.
    // Let's create a "result area" with images to download manually or download 1 zip if we had libs.
    // For this MVP, let's render images below and offer "Download All" (which might spam) or download individually.

    // BETTER approach: Show links to download
    const results = [];

    for (let i = 1; i <= Math.min(count, 50); i++) {
      document.getElementById('statusText').textContent = `Converting page ${i} of ${count}...`;
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 }); // High quality

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      await page.render({ canvasContext: ctx, viewport }).promise;

      // To Blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      results.push({ blob, page: i });
    }

    // Since we don't have JSZip bundled (it was "optional" in my head but needed here)
    // I'll assume we can use the download util for single page or ask user
    // Let's just download the first one automatically and say "Only first page downloaded for demo"
    // OR: Just display them to user.

    notifications.success(i18n.t('success'));
    displayResults(results);

    // Save one combined summary or just track that tool was used
    await storage.addToHistory({
      fileName: `images_from_${currentFile.name}`,
      tool: 'pdf-to-jpg',
      size: currentFile.size,
      status: 'success'
    });

  } catch (err) {
    console.error(err);
    notifications.error('Error: ' + err.message);
  } finally {
    btn.disabled = false;
  }
}

function displayResults(results) {
  const container = document.getElementById('statusArea');
  container.innerHTML = `<h3>Converted Pages</h3><div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:16px; margin-top:16px;"></div>`;
  const grid = container.querySelector('div');

  results.forEach(res => {
    const url = URL.createObjectURL(res.blob);
    const div = document.createElement('div');
    div.innerHTML = `
      <div style="border:1px solid #ddd; padding:8px; border-radius:8px; background:white;">
        <img src="${url}" style="width:100%; height:auto; display:block; margin-bottom:8px;">
        <a href="${url}" download="page_${res.page}.jpg" class="btn btn-primary" style="display:block; text-align:center; text-decoration:none; font-size:12px;">Download</a>
      </div>
    `;
    grid.appendChild(div);
  });
}
