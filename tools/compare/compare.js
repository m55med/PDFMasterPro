// Compare PDFs Tool
const uploadCard1 = document.getElementById('uploadCard1');
const uploadCard2 = document.getElementById('uploadCard2');
const fileInput1 = document.getElementById('fileInput1');
const fileInput2 = document.getElementById('fileInput2');
const fileName1 = document.getElementById('fileName1');
const fileName2 = document.getElementById('fileName2');
const compareBtn = document.getElementById('compareBtn');
const uploadSection = document.getElementById('uploadSection');
const compareView = document.getElementById('compareView');

const canvas1 = document.getElementById('canvas1');
const canvas2 = document.getElementById('canvas2');
const overlayCanvas = document.getElementById('overlayCanvas');
const title1 = document.getElementById('title1');
const title2 = document.getElementById('title2');

const sideBySide = document.getElementById('sideBySide');
const overlayView = document.getElementById('overlayView');
const diffIndicator = document.getElementById('diffIndicator');

const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

let pdf1 = null;
let pdf2 = null;
let file1Name = '';
let file2Name = '';
let currentPage = 1;
let maxPages = 1;

pdfjsLib.GlobalWorkerOptions.workerSrc = '../../lib/pdf.worker.min.js';

uploadCard1.addEventListener('click', () => fileInput1.click());
uploadCard2.addEventListener('click', () => fileInput2.click());

fileInput1.addEventListener('change', async (e) => {
    if (e.target.files[0]) {
        const file = e.target.files[0];
        file1Name = file.name;
        fileName1.textContent = file.name;
        uploadCard1.classList.add('has-file');

        const arrayBuffer = await file.arrayBuffer();
        pdf1 = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        checkReady();
    }
});

fileInput2.addEventListener('change', async (e) => {
    if (e.target.files[0]) {
        const file = e.target.files[0];
        file2Name = file.name;
        fileName2.textContent = file.name;
        uploadCard2.classList.add('has-file');

        const arrayBuffer = await file.arrayBuffer();
        pdf2 = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        checkReady();
    }
});

function checkReady() {
    compareBtn.disabled = !(pdf1 && pdf2);
}

compareBtn.addEventListener('click', () => {
    if (!pdf1 || !pdf2) return;

    maxPages = Math.max(pdf1.numPages, pdf2.numPages);
    currentPage = 1;

    title1.textContent = file1Name;
    title2.textContent = file2Name;

    uploadSection.style.display = 'none';
    compareView.classList.add('active');

    updatePageNav();
    renderComparison();
});

async function renderComparison() {
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');
    const ctxOverlay = overlayCanvas.getContext('2d');

    // Render PDF 1
    if (currentPage <= pdf1.numPages) {
        const page1 = await pdf1.getPage(currentPage);
        const viewport1 = page1.getViewport({ scale: 1.0 });
        const scale1 = 400 / viewport1.width;
        const scaledViewport1 = page1.getViewport({ scale: scale1 });

        canvas1.width = scaledViewport1.width;
        canvas1.height = scaledViewport1.height;

        await page1.render({
            canvasContext: ctx1,
            viewport: scaledViewport1
        }).promise;
    } else {
        canvas1.width = 400;
        canvas1.height = 565;
        ctx1.fillStyle = '#F3F4F6';
        ctx1.fillRect(0, 0, canvas1.width, canvas1.height);
        ctx1.fillStyle = '#9CA3AF';
        ctx1.textAlign = 'center';
        ctx1.fillText('No page', 200, 280);
    }

    // Render PDF 2
    if (currentPage <= pdf2.numPages) {
        const page2 = await pdf2.getPage(currentPage);
        const viewport2 = page2.getViewport({ scale: 1.0 });
        const scale2 = 400 / viewport2.width;
        const scaledViewport2 = page2.getViewport({ scale: scale2 });

        canvas2.width = scaledViewport2.width;
        canvas2.height = scaledViewport2.height;

        await page2.render({
            canvasContext: ctx2,
            viewport: scaledViewport2
        }).promise;
    } else {
        canvas2.width = 400;
        canvas2.height = 565;
        ctx2.fillStyle = '#F3F4F6';
        ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
        ctx2.fillStyle = '#9CA3AF';
        ctx2.textAlign = 'center';
        ctx2.fillText('No page', 200, 280);
    }

    // Create overlay comparison
    const width = Math.max(canvas1.width, canvas2.width);
    const height = Math.max(canvas1.height, canvas2.height);

    overlayCanvas.width = width;
    overlayCanvas.height = height;

    // Draw first PDF
    ctxOverlay.drawImage(canvas1, 0, 0);

    // Draw second PDF with difference blend mode
    ctxOverlay.globalCompositeOperation = 'difference';
    ctxOverlay.drawImage(canvas2, 0, 0);
    ctxOverlay.globalCompositeOperation = 'source-over';

    // Check for differences
    const imgData1 = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
    const imgData2 = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);

    let diffCount = 0;
    const minLen = Math.min(imgData1.data.length, imgData2.data.length);

    for (let i = 0; i < minLen; i += 4) {
        if (Math.abs(imgData1.data[i] - imgData2.data[i]) > 10 ||
            Math.abs(imgData1.data[i + 1] - imgData2.data[i + 1]) > 10 ||
            Math.abs(imgData1.data[i + 2] - imgData2.data[i + 2]) > 10) {
            diffCount++;
        }
    }

    const diffPercent = (diffCount / (minLen / 4)) * 100;

    if (diffPercent < 1) {
        diffIndicator.className = 'diff-indicator same';
        diffIndicator.textContent = 'Pages are identical';
    } else {
        diffIndicator.className = 'diff-indicator different';
        diffIndicator.textContent = `Pages have differences (~${diffPercent.toFixed(1)}% different)`;
    }
}

// View toggle
document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (btn.dataset.view === 'side') {
            sideBySide.style.display = 'flex';
            overlayView.classList.remove('active');
        } else {
            sideBySide.style.display = 'none';
            overlayView.classList.add('active');
        }
    });
});

// Page navigation
function updatePageNav() {
    pageInfo.textContent = `Page ${currentPage} of ${maxPages}`;
    prevPage.disabled = currentPage <= 1;
    nextPage.disabled = currentPage >= maxPages;
}

prevPage.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        updatePageNav();
        renderComparison();
    }
});

nextPage.addEventListener('click', () => {
    if (currentPage < maxPages) {
        currentPage++;
        updatePageNav();
        renderComparison();
    }
});
