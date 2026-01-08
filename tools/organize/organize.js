// Organize PDF Tool
const { PDFDocument } = PDFLib;

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '../../lib/pdf.worker.min.js';

class OrganizePDF {
    constructor() {
        this.pdfLibDoc = null;
        this.pdfJsDoc = null;
        this.pdfBytes = null;
        this.pages = [];
        this.selectedPages = new Set();
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea?.addEventListener('click', () => fileInput?.click());
        fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));

        uploadArea?.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea?.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea?.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/pdf') {
                this.loadPDF(file);
            }
        });

        document.getElementById('selectAllBtn')?.addEventListener('click', () => this.selectAll());
        document.getElementById('deselectAllBtn')?.addEventListener('click', () => this.deselectAll());
        document.getElementById('deleteSelectedBtn')?.addEventListener('click', () => this.deleteSelected());
        document.getElementById('processBtn')?.addEventListener('click', () => this.savePDF());
        document.getElementById('cancelBtn')?.addEventListener('click', () => this.reset());
        document.getElementById('newFileBtn')?.addEventListener('click', () => this.reset());
        document.getElementById('downloadBtn')?.addEventListener('click', () => this.download());
    }

    async handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            await this.loadPDF(file);
        }
    }

    async loadPDF(file) {
        try {
            this.showSection('processingSection');

            this.pdfBytes = await file.arrayBuffer();
            this.pdfLibDoc = await PDFDocument.load(this.pdfBytes);
            this.pdfJsDoc = await pdfjsLib.getDocument({ data: this.pdfBytes.slice(0) }).promise;
            this.fileName = file.name;

            const pageCount = this.pdfLibDoc.getPageCount();
            this.pages = Array.from({ length: pageCount }, (_, i) => i);

            await this.renderPages();
            this.showSection('editorSection');

        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Failed to load PDF file. Please try again.');
            this.showSection('uploadSection');
        }
    }

    async renderPages() {
        const grid = document.getElementById('pagesGrid');
        const fileNameEl = document.getElementById('fileName');
        const pageCountEl = document.getElementById('pageCount');

        if (!grid) return;

        fileNameEl.textContent = this.fileName;
        pageCountEl.textContent = `${this.pages.length} pages`;

        grid.innerHTML = '';
        this.selectedPages.clear();

        for (let displayIndex = 0; displayIndex < this.pages.length; displayIndex++) {
            const pageIndex = this.pages[displayIndex];
            const pageItem = await this.createPageItem(pageIndex, displayIndex);
            grid.appendChild(pageItem);
        }

        this.enableDragAndDrop();
    }

    async createPageItem(pageIndex, displayIndex) {
        const div = document.createElement('div');
        div.className = 'page-item';
        div.draggable = true;
        div.dataset.pageIndex = pageIndex;
        div.dataset.displayIndex = displayIndex;

        div.innerHTML = `
            <input type="checkbox" class="page-checkbox" data-index="${displayIndex}">
            <div class="page-preview" id="preview-${displayIndex}">
                <canvas class="page-canvas"></canvas>
            </div>
            <div class="page-details">
                <div class="page-title">Page ${displayIndex + 1}</div>
                <div class="page-meta">Click to select • Drag to reorder</div>
                <div class="page-actions">
                    <button class="page-action-btn" data-action="duplicate" data-index="${displayIndex}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        Duplicate
                    </button>
                </div>
            </div>
        `;

        // Render preview using PDF.js
        await this.renderPagePreview(pageIndex, div.querySelector('.page-canvas'));

        // Checkbox event
        const checkbox = div.querySelector('.page-checkbox');
        checkbox.addEventListener('change', (e) => {
            const idx = parseInt(div.dataset.displayIndex);
            if (e.target.checked) {
                this.selectedPages.add(idx);
                div.classList.add('selected');
            } else {
                this.selectedPages.delete(idx);
                div.classList.remove('selected');
            }
            this.updateDeleteButton();
        });

        // Duplicate button
        const duplicateBtn = div.querySelector('[data-action="duplicate"]');
        duplicateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.duplicatePage(parseInt(div.dataset.displayIndex));
        });

        return div;
    }

    async renderPagePreview(pageIndex, canvas) {
        if (!this.pdfJsDoc || !canvas) return;

        try {
            const page = await this.pdfJsDoc.getPage(pageIndex + 1);

            const targetWidth = 140;
            const targetHeight = targetWidth * 1.414;

            const viewport = page.getViewport({ scale: 1.0 });
            const scale = targetWidth / viewport.width;
            const scaledViewport = page.getViewport({ scale });

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            const context = canvas.getContext('2d');
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);

            await page.render({
                canvasContext: context,
                viewport: scaledViewport
            }).promise;

        } catch (error) {
            console.error('Error rendering page preview:', error);
        }
    }

    enableDragAndDrop() {
        const grid = document.getElementById('pagesGrid');
        let draggedItem = null;

        grid.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('page-item')) {
                draggedItem = e.target;
                e.target.classList.add('dragging');
            }
        });

        grid.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('page-item')) {
                e.target.classList.remove('dragging');
                draggedItem = null;
            }
        });

        grid.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!draggedItem) return;

            const afterElement = this.getDragAfterElement(grid, e.clientY);
            if (afterElement == null) {
                grid.appendChild(draggedItem);
            } else {
                grid.insertBefore(draggedItem, afterElement);
            }
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.page-item:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    selectAll() {
        const items = document.querySelectorAll('.page-item');
        items.forEach((item, index) => {
            const cb = item.querySelector('.page-checkbox');
            cb.checked = true;
            this.selectedPages.add(index);
            item.classList.add('selected');
        });
        this.updateDeleteButton();
    }

    deselectAll() {
        const items = document.querySelectorAll('.page-item');
        items.forEach(item => {
            const cb = item.querySelector('.page-checkbox');
            cb.checked = false;
            item.classList.remove('selected');
        });
        this.selectedPages.clear();
        this.updateDeleteButton();
    }

    deleteSelected() {
        if (this.selectedPages.size === 0) return;
        if (this.selectedPages.size === this.pages.length) {
            alert('Cannot delete all pages. At least one page must remain.');
            return;
        }

        const confirmed = confirm(`Delete ${this.selectedPages.size} selected page(s)?`);
        if (!confirmed) return;

        this.pages = this.pages.filter((_, index) => !this.selectedPages.has(index));
        this.renderPages();
    }

    duplicatePage(index) {
        const pageIndex = this.pages[index];
        this.pages.splice(index + 1, 0, pageIndex);
        this.renderPages();
    }

    updateDeleteButton() {
        const deleteBtn = document.getElementById('deleteSelectedBtn');
        if (deleteBtn) {
            deleteBtn.disabled = this.selectedPages.size === 0;
        }
    }

    async savePDF() {
        try {
            this.showSection('processingSection');

            const pageItems = document.querySelectorAll('.page-item');
            const newOrder = Array.from(pageItems).map(item =>
                parseInt(item.dataset.pageIndex)
            );

            const newPdf = await PDFDocument.create();

            for (const pageIndex of newOrder) {
                const [copiedPage] = await newPdf.copyPages(this.pdfLibDoc, [pageIndex]);
                newPdf.addPage(copiedPage);
            }

            this.resultPdfBytes = await newPdf.save();
            this.resultFileName = this.fileName.replace('.pdf', '_organized.pdf');

            const originalCount = this.pdfLibDoc.getPageCount();
            const newCount = newOrder.length;

            // Update stats
            document.getElementById('originalPages').textContent = `${originalCount} pages`;
            document.getElementById('newPages').textContent = `${newCount} pages`;
            document.getElementById('resultMessage').textContent = originalCount === newCount
                ? 'Pages have been reordered successfully'
                : `${originalCount - newCount} page(s) removed`;

            this.showSection('resultSection');

        } catch (error) {
            console.error('Error saving PDF:', error);
            alert('Failed to organize PDF. Please try again.');
            this.showSection('editorSection');
        }
    }

    download() {
        if (!this.resultPdfBytes) return;

        const blob = new Blob([this.resultPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.resultFileName;
        link.click();
        URL.revokeObjectURL(url);
    }

    reset() {
        this.pdfLibDoc = null;
        this.pdfJsDoc = null;
        this.pdfBytes = null;
        this.pages = [];
        this.selectedPages.clear();
        this.resultPdfBytes = null;
        document.getElementById('fileInput').value = '';
        this.showSection('uploadSection');
    }

    showSection(sectionId) {
        const sections = ['uploadSection', 'editorSection', 'processingSection', 'resultSection'];
        sections.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                section.style.display = id === sectionId ? 'block' : 'none';
            }
        });
    }
}

new OrganizePDF();
