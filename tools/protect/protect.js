// Protect Tool Logic
import { pdfProcessor } from '../../lib/pdf-processor.js';
import { notifications } from '../../utils/notifications.js';

let currentFile = null;

document.getElementById('uploadArea').addEventListener('click', () => document.getElementById('fileInput').click());

document.getElementById('fileInput').addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

document.getElementById('protectBtn').addEventListener('click', async () => {
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (!password) {
        notifications.error('Please enter a password');
        return;
    }

    if (password !== confirm) {
        notifications.error('Passwords do not match');
        return;
    }

    const btn = document.getElementById('protectBtn');
    btn.disabled = true;
    btn.textContent = 'Encrypting...';

    try {
        const arrayBuffer = await pdfProcessor.fileToArrayBuffer(currentFile);
        await pdfProcessor.ensureInit();
        const { PDFDocument } = pdfProcessor.pdfLib;

        const doc = await PDFDocument.load(arrayBuffer);

        // Encrypt
        const preventPrint = document.getElementById('preventPrint').checked;
        const preventModify = document.getElementById('preventModify').checked;
        const preventCopy = document.getElementById('preventCopy').checked;

        doc.encrypt({
            userPassword: password,
            ownerPassword: password, // Simple fallback, usually owner should be different but for personal use same is ok
            permissions: {
                printing: !preventPrint ? 'highResolution' : undefined,
                modifying: !preventModify,
                copying: !preventCopy,
                annotating: !preventModify,
                fillingForms: !preventModify,
                contentAccessibility: true,
                documentAssembly: !preventModify
            },
        });

        const encryptedBytes = await doc.save();

        pdfProcessor.downloadFile(encryptedBytes, `protected_${currentFile.name}`);
        notifications.success('PDF encrypted successfully');

    } catch (err) {
        console.error(err);
        notifications.error('Encryption failed: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Encrypt PDF';
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
    document.getElementById('protectBtn').disabled = false;
}
