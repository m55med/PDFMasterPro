import { PDFDocument } from '../../lib/pdf-lib.min.js';

class OrganizePDF {
    constructor() {
        this.pdfDoc = null;
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

            const arrayBuffer = await file.arrayBuffer();
            this.pdfDoc = await PDFDocument.load(arrayBuffer);
            this.fileName = file.name;

            // Get all pages
            const pageCount = this.pdfDoc.getPageCount();
            this.pages = Array.from({ length: pageCount }, (_, i) => i);

            this.renderPages();
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

        this.pages.forEach((pageIndex, displayIndex) => {
            const pageItem = this.createPageItem(pageIndex, displayIndex);
            grid.appendChild(pageItem);
        });

        // Enable drag and drop
        this.enableDragAndDrop();
    }

    createPageItem(pageIndex, displayIndex) {
        const div = document.createElement('div');
        div.className = 'page-item';
        div.draggable = true;
        div.dataset.pageIndex = pageIndex;
        div.dataset.displayIndex = displayIndex;

        div.innerHTML = `
            <input type="checkbox" class="page-checkbox" data-index="${displayIndex}">
            <div class="page-number">${displayIndex + 1}</div>
            <div class="page-preview">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
            </div>
            <div class="page-actions">
                <button class="page-action-btn" data-action="duplicate" data-index="${displayIndex}">Duplicate</button>
            </div>
        `;

        // Checkbox event
        const checkbox = div.querySelector('.page-checkbox');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.selectedPages.add(displayIndex);
                div.classList.add('selected');
            } else {
                this.selectedPages.delete(displayIndex);
                div.classList.remove('selected');
            }
            this.updateDeleteButton();
        });

        // Duplicate button
        const duplicateBtn = div.querySelector('[data-action="duplicate"]');
        duplicateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.duplicatePage(displayIndex);
        });

        return div;
    }

    enableDragAndDrop() {
        const pageItems = document.querySelectorAll('.page-item');
        let draggedItem = null;

        pageItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = this.getDragAfterElement(e.clientY);
                if (afterElement == null) {
                    item.parentElement.appendChild(draggedItem);
                } else {
                    item.parentElement.insertBefore(draggedItem, afterElement);
                }
            });
        });
    }

    getDragAfterElement(y) {
        const draggableElements = [...document.querySelectorAll('.page-item:not(.dragging)')];
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
        const checkboxes = document.querySelectorAll('.page-checkbox');
        checkboxes.forEach((cb, index) => {
            cb.checked = true;
            this.selectedPages.add(index);
            cb.closest('.page-item').classList.add('selected');
        });
        this.updateDeleteButton();
    }

    deselectAll() {
        const checkboxes = document.querySelectorAll('.page-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = false;
            cb.closest('.page-item').classList.remove('selected');
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

        // Remove selected pages
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

            // Get current page order from DOM
            const pageItems = document.querySelectorAll('.page-item');
            const newOrder = Array.from(pageItems).map(item =>
                parseInt(item.dataset.pageIndex)
            );

            // Create new PDF with reordered pages
            const newPdf = await PDFDocument.create();

            for (const pageIndex of newOrder) {
                const [copiedPage] = await newPdf.copyPages(this.pdfDoc, [pageIndex]);
                newPdf.addPage(copiedPage);
            }

            this.resultPdfBytes = await newPdf.save();
            this.resultFileName = this.fileName.replace('.pdf', '_organized.pdf');

            document.getElementById('resultMessage').textContent =
                `Your PDF has been reorganized from ${this.pdfDoc.getPageCount()} to ${newOrder.length} pages`;

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
        this.pdfDoc = null;
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

