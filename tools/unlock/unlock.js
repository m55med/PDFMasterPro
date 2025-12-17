// Unlock Tool Logic
import { pdfProcessor } from '../../lib/pdf-processor.js';
import { notifications } from '../../utils/notifications.js';

let currentFile = null;

document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('fileInput').click());

document.getElementById('fileInput').addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

document.getElementById('unlockBtn').addEventListener('click', async () => {
    const password = document.getElementById('password').value;

    if (!password) {
        notifications.error('Please enter the password');
        document.getElementById('password').focus();
        return;
    }

    const btn = document.getElementById('unlockBtn');
    btn.disabled = true;
    btn.textContent = 'Unlocking...';

    try {
        const arrayBuffer = await pdfProcessor.fileToArrayBuffer(currentFile);
        await pdfProcessor.ensureInit();
        const { PDFDocument } = pdfProcessor.pdfLib;

        // Try to load with password
        // Note: PDF-lib load with password will decrypt it automatically if correct
        const doc = await PDFDocument.load(arrayBuffer, { password });

        // Process it (which re-saves it without encryption by default if we don't call encrypt)
        const decryptedBytes = await doc.save();

        pdfProcessor.downloadFile(decryptedBytes, `unlocked_${currentFile.name}`);
        notifications.success('PDF unlocked successfully');

    } catch (err) {
        console.error(err);
        if (err.message.includes('Password') || err.message.includes('encrypt')) {
            notifications.error('Incorrect password');
            document.getElementById('password').classList.add('error');
        } else {
            notifications.error('Unlock failed: ' + err.message);
        }
    } finally {
        btn.disabled = false;
        btn.textContent = 'Unlock PDF';
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

    document.getElementById('passwordForm').classList.remove('hidden');
    document.getElementById('resetBtn').addEventListener('click', () => location.reload());
    document.getElementById('unlockBtn').disabled = false;
    document.getElementById('password').focus();
}
