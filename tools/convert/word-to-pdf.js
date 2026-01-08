// Word to PDF Converter
const { PDFDocument, rgb, StandardFonts } = PDFLib;

// Filter text to only include WinAnsi-compatible characters
// Standard PDF fonts (Helvetica, Times, etc.) only support Latin characters
function filterSupportedText(text) {
    // WinAnsi encoding supports: Basic Latin, Latin-1 Supplement, and some Latin Extended
    // Character ranges: 0x0020-0x007E (Basic Latin), 0x00A0-0x00FF (Latin-1)
    let filtered = '';
    let hasUnsupported = false;

    for (const char of text) {
        const code = char.charCodeAt(0);
        // Allow: space, printable ASCII, Latin-1 Supplement (excluding control chars)
        if ((code >= 0x0020 && code <= 0x007E) || (code >= 0x00A0 && code <= 0x00FF)) {
            filtered += char;
        } else if (char === '\n' || char === '\r' || char === '\t') {
            filtered += char; // Keep whitespace characters
        } else {
            hasUnsupported = true;
            filtered += ' '; // Replace unsupported with space
        }
    }

    if (hasUnsupported) {
        console.warn('Some characters (Arabic, Chinese, etc.) were filtered out. Standard PDF fonts only support Latin characters.');
    }

    return filtered;
}

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeBtn = document.getElementById('removeBtn');
const convertBtn = document.getElementById('convertBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

let selectedFile = null;

// Upload area click
uploadArea.addEventListener('click', () => fileInput.click());

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
    if (file && (file.name.endsWith('.docx') || file.name.endsWith('.doc'))) {
        handleFile(file);
    }
});

// File input change
fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
        handleFile(e.target.files[0]);
    }
});

// Handle file selection
function handleFile(file) {
    selectedFile = file;
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);

    uploadArea.style.display = 'none';
    filePreview.classList.add('active');
    convertBtn.disabled = false;
}

// Remove file
removeBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    uploadArea.style.display = 'block';
    filePreview.classList.remove('active');
    convertBtn.disabled = true;
    progressContainer.classList.remove('active');
});

// Convert button
convertBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    convertBtn.disabled = true;
    progressContainer.classList.add('active');
    updateProgress(10, 'Reading document...');

    try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        updateProgress(30, 'Extracting content...');

        // Use mammoth to extract text from docx
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = filterSupportedText(result.value);

        updateProgress(50, 'Creating PDF...');

        // Create PDF
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const fontSize = 12;
        const margin = 50;
        const lineHeight = fontSize * 1.5;

        // Split text into lines
        const words = text.split(/\s+/);
        const lines = [];
        let currentLine = '';
        const maxWidth = 595 - (margin * 2); // A4 width minus margins

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const textWidth = font.widthOfTextAtSize(testLine, fontSize);

            if (textWidth > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }

        updateProgress(70, 'Generating pages...');

        // Calculate lines per page
        const pageHeight = 842; // A4 height
        const usableHeight = pageHeight - (margin * 2);
        const linesPerPage = Math.floor(usableHeight / lineHeight);

        // Create pages
        let currentLineIndex = 0;
        while (currentLineIndex < lines.length) {
            const page = pdfDoc.addPage([595, 842]); // A4 size
            let y = pageHeight - margin;

            for (let i = 0; i < linesPerPage && currentLineIndex < lines.length; i++) {
                page.drawText(lines[currentLineIndex], {
                    x: margin,
                    y: y - (i * lineHeight),
                    size: fontSize,
                    font: font,
                    color: rgb(0, 0, 0),
                });
                currentLineIndex++;
            }
        }

        // If no content, add empty page
        if (lines.length === 0) {
            pdfDoc.addPage([595, 842]);
        }

        updateProgress(90, 'Saving PDF...');

        // Save PDF
        const pdfBytes = await pdfDoc.save();

        // Download
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedFile.name.replace(/\.(docx|doc)$/i, '.pdf');
        a.click();
        URL.revokeObjectURL(url);

        updateProgress(100, 'Done!');

        setTimeout(() => {
            progressContainer.classList.remove('active');
            convertBtn.disabled = false;
        }, 1500);

    } catch (error) {
        console.error('Conversion error:', error);
        updateProgress(0, 'Error: ' + error.message);
        convertBtn.disabled = false;
    }
});

function updateProgress(percent, text) {
    progressFill.style.width = `${percent}%`;
    progressText.textContent = text;
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
