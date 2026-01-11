// Repair PDF Tool
const { PDFDocument } = PDFLib;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const repairContainer = document.getElementById('repairContainer');
const fileCard = document.getElementById('fileCard');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeBtn = document.getElementById('removeBtn');
const repairBtn = document.getElementById('repairBtn');
const repairOptions = document.getElementById('repairOptions');
const statusCard = document.getElementById('statusCard');
const statusIcon = document.getElementById('statusIcon');
const statusTitle = document.getElementById('statusTitle');
const statusMessage = document.getElementById('statusMessage');
const resultActions = document.getElementById('resultActions');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const downloadBtn = document.getElementById('downloadBtn');

let selectedFile = null;
let repairedPdfBytes = null;

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

function handleFile(file) {
    selectedFile = file;
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);

    uploadArea.classList.add('hidden');
    repairContainer.classList.remove('hidden');
    repairBtn.disabled = false;

    // Reset status
    statusCard.classList.add('hidden');
    fileCard.classList.remove('hidden');
    repairOptions.classList.remove('hidden');
}

removeBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    uploadArea.classList.remove('hidden');
    repairContainer.classList.add('hidden');
    repairBtn.disabled = true;
});

repairBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    repairBtn.disabled = true;
    fileCard.classList.add('hidden');
    repairOptions.classList.add('hidden');
    statusCard.classList.remove('hidden');
    resultActions.classList.add('hidden');

    setStatus('loading', 'Repairing...', 'Reading PDF file...');

    try {
        const arrayBuffer = await selectedFile.arrayBuffer();

        setStatus('loading', 'Repairing...', 'Analyzing PDF structure...');
        await delay(500);

        // Try to load with recovery options
        let pdfDoc;
        try {
            pdfDoc = await PDFDocument.load(arrayBuffer, {
                ignoreEncryption: true,
                updateMetadata: false
            });
        } catch (loadError) {
            // Try more aggressive recovery
            setStatus('loading', 'Repairing...', 'Attempting recovery mode...');
            await delay(500);

            try {
                pdfDoc = await PDFDocument.load(arrayBuffer, {
                    ignoreEncryption: true,
                    updateMetadata: false,
                    throwOnInvalidObject: false
                });
            } catch (recoveryError) {
                throw new Error('PDF is too corrupted to repair. The file structure is severely damaged.');
            }
        }

        setStatus('loading', 'Repairing...', 'Rebuilding document structure...');
        await delay(500);

        // Create a new clean PDF
        const newPdf = await PDFDocument.create();

        // Copy pages
        const pageCount = pdfDoc.getPageCount();
        let recoveredPages = 0;

        setStatus('loading', 'Repairing...', `Recovering pages (0/${pageCount})...`);

        for (let i = 0; i < pageCount; i++) {
            try {
                const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
                newPdf.addPage(copiedPage);
                recoveredPages++;
                setStatus('loading', 'Repairing...', `Recovering pages (${recoveredPages}/${pageCount})...`);
            } catch (pageError) {
                console.warn(`Could not recover page ${i + 1}:`, pageError);
            }
        }

        if (recoveredPages === 0) {
            throw new Error('Could not recover any pages from the PDF.');
        }

        setStatus('loading', 'Repairing...', 'Finalizing repaired PDF...');
        await delay(300);

        repairedPdfBytes = await newPdf.save();

        // Success
        setStatus('success', 'Repair Complete!',
            `Successfully recovered ${recoveredPages} of ${pageCount} pages.`);
        resultActions.classList.remove('hidden');

    } catch (error) {
        console.error('Repair error:', error);
        setStatus('error', 'Repair Failed', error.message);
        resultActions.classList.remove('hidden');
        downloadBtn.classList.add('hidden');
    }
});

function setStatus(type, title, message) {
    statusTitle.textContent = title;
    statusMessage.textContent = message;

    statusIcon.className = 'status-icon ' + type;

    if (type === 'loading') {
        statusIcon.innerHTML = '<div class="spinner"></div>';
    } else if (type === 'success') {
        statusIcon.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        `;
        downloadBtn.classList.remove('hidden');
    } else if (type === 'error') {
        statusIcon.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        `;
    }
}

tryAgainBtn.addEventListener('click', () => {
    statusCard.classList.add('hidden');
    fileCard.classList.remove('hidden');
    repairOptions.classList.remove('hidden');
    repairBtn.disabled = false;
    downloadBtn.classList.remove('hidden');
});

downloadBtn.addEventListener('click', () => {
    if (!repairedPdfBytes) return;

    const blob = new Blob([repairedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'repaired_' + (selectedFile?.name || 'document.pdf');
    a.click();
    URL.revokeObjectURL(url);
});

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
