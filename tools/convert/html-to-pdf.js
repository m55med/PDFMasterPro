// HTML to PDF Converter
const { PDFDocument, rgb, StandardFonts } = PDFLib;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const inputSection = document.getElementById('inputSection');
const htmlCode = document.getElementById('htmlCode');
const convertBtn = document.getElementById('convertBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeBtn = document.getElementById('removeBtn');

const tabBtns = document.querySelectorAll('.tab-btn');
const codeTab = document.getElementById('codeTab');
const fileTab = document.getElementById('fileTab');

let selectedFile = null;

// Tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (btn.dataset.tab === 'code') {
            codeTab.classList.add('active');
            fileTab.classList.remove('active');
        } else {
            codeTab.classList.remove('active');
            fileTab.classList.add('active');
        }
    });
});

// Upload area
uploadArea.addEventListener('click', () => fileInput.click());

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
    if (file && (file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
        handleFile(file);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
        handleFile(e.target.files[0]);
    }
});

async function handleFile(file) {
    selectedFile = file;
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);

    const text = await file.text();
    htmlCode.value = text;

    uploadArea.classList.add('hidden');
    inputSection.classList.remove('hidden');
    convertBtn.disabled = false;

    // Show file tab
    tabBtns.forEach(b => b.classList.remove('active'));
    tabBtns[1].classList.add('active');
    codeTab.classList.remove('active');
    fileTab.classList.add('active');
}

// HTML code input
htmlCode.addEventListener('input', () => {
    convertBtn.disabled = htmlCode.value.trim().length === 0;
    if (htmlCode.value.trim().length > 0) {
        uploadArea.classList.add('hidden');
        inputSection.classList.remove('hidden');
    }
});

// Remove file
removeBtn.addEventListener('click', () => {
    selectedFile = null;
    htmlCode.value = '';
    fileInput.value = '';
    uploadArea.classList.remove('hidden');
    inputSection.classList.add('hidden');
    convertBtn.disabled = true;
});

// Convert
convertBtn.addEventListener('click', async () => {
    const html = htmlCode.value.trim();
    if (!html) return;

    convertBtn.disabled = true;
    progressContainer.classList.add('active');
    updateProgress(10, 'Parsing HTML...');

    try {
        // Parse HTML and extract text
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        updateProgress(30, 'Extracting content...');

        // Get text content and filter unsupported characters
        const rawText = doc.body.innerText || doc.body.textContent || '';
        const { text: textContent, hasUnsupported } = filterSupportedText(rawText);

        if (hasUnsupported) {
            console.warn('Some characters (Arabic, Chinese, etc.) were removed - standard fonts only support Latin characters');
        }

        updateProgress(50, 'Creating PDF...');

        // Create PDF
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const pageSize = document.getElementById('pageSize').value;
        const orientation = document.getElementById('orientation').value;

        let width = 595;
        let height = 842;

        if (pageSize === 'letter') {
            width = 612;
            height = 792;
        } else if (pageSize === 'legal') {
            width = 612;
            height = 1008;
        }

        if (orientation === 'landscape') {
            [width, height] = [height, width];
        }

        const marginVal = document.getElementById('margin').value;
        let margin = 50;
        if (marginVal === 'narrow') margin = 30;
        if (marginVal === 'none') margin = 20;

        const fontSize = 11;
        const lineHeight = fontSize * 1.5;
        const maxWidth = width - (margin * 2);

        // Split text into lines
        const words = textContent.split(/\s+/);
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            if (!word) continue;
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

        const usableHeight = height - (margin * 2);
        const linesPerPage = Math.floor(usableHeight / lineHeight);

        let currentLineIndex = 0;
        while (currentLineIndex < lines.length) {
            const page = pdfDoc.addPage([width, height]);
            let y = height - margin;

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

        if (lines.length === 0) {
            pdfDoc.addPage([width, height]);
        }

        updateProgress(90, 'Saving PDF...');

        const pdfBytes = await pdfDoc.save();

        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedFile ? selectedFile.name.replace(/\.(html|htm)$/i, '.pdf') : 'converted.pdf';
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

// Filter text to only include characters supported by WinAnsi encoding
function filterSupportedText(text) {
    // WinAnsi supported characters (basic Latin + extended Latin)
    // Remove Arabic, Chinese, and other non-Latin characters
    let filtered = '';
    let hasUnsupported = false;

    for (const char of text) {
        const code = char.charCodeAt(0);
        // Allow ASCII printable (32-126), Latin-1 Supplement (160-255), and common whitespace
        if ((code >= 32 && code <= 126) || (code >= 160 && code <= 255) || code === 9 || code === 10 || code === 13) {
            filtered += char;
        } else if (code > 255) {
            hasUnsupported = true;
            filtered += ' '; // Replace unsupported with space
        }
    }

    return { text: filtered, hasUnsupported };
}
