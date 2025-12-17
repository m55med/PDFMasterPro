// Merge Tool Logic

import { pdfProcessor } from '../../lib/pdf-processor.js';
import { storage } from '../../utils/storage.js';
import { notifications } from '../../utils/notifications.js';

class MergeTool {
    constructor() {
        this.files = []; // Array of File objects
        this.init();
    }

    init() {
        this.bindEvents();
        this.initSortable();
    }

    bindEvents() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const mergeBtn = document.getElementById('mergeBtn');
        const addMoreBtn = document.getElementById('addMoreBtn');

        // Upload interactions
        uploadArea.addEventListener('click', () => fileInput.click());
        addMoreBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('hover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('hover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('hover');
            this.handleFiles(e.dataTransfer.files);
        });

        // Remove file action
        document.getElementById('fileList').addEventListener('click', (e) => {
            const btn = e.target.closest('.remove-btn');
            if (btn) {
                const index = parseInt(btn.dataset.index);
                this.removeFile(index);
            }
        });
    }

    initSortable() {
        const el = document.getElementById('fileList');
        if (typeof Sortable !== 'undefined') {
            new Sortable(el, {
                animation: 150,
                handle: '.file-item', // Drag whole item
                ghostClass: 'ghost-class',
                onEnd: (evt) => {
                    // Reorder internal files array
                    const movedItem = this.files.splice(evt.oldIndex, 1)[0];
                    this.files.splice(evt.newIndex, 0, movedItem);
                }
            });
        }
    }

    handleFiles(fileList) {
        const newFiles = Array.from(fileList).filter(f => f.type === 'application/pdf');

        if (newFiles.length === 0) {
            notifications.warning('Please select PDF files');
            return;
        }

        this.files = [...this.files, ...newFiles];
        this.renderFileList();
        this.updateUIState();
    }

    renderFileList() {
        const list = document.getElementById('fileList');
        const uploadArea = document.getElementById('uploadArea');

        if (this.files.length > 0) {
            uploadArea.classList.add('hidden');
            list.innerHTML = this.files.map((file, index) => `
        <div class="file-item" data-index="${index}">
          <div class="file-info">
            <div class="drag-handle">⋮⋮</div>
            <div class="file-preview">PDF</div>
            <div>
              <div class="name">${file.name}</div>
              <div class="size" style="font-size: 12px; color: #64748B">${this.formatSize(file.size)}</div>
            </div>
          </div>
          <button class="remove-btn" data-index="${index}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      `).join('');
        } else {
            uploadArea.classList.remove('hidden');
            list.innerHTML = '';
        }
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.renderFileList();
        this.updateUIState();
    }

    updateUIState() {
        const mergeBtn = document.getElementById('mergeBtn');
        const addMoreBtn = document.getElementById('addMoreBtn');

        const hasFiles = this.files.length >= 2;
        mergeBtn.disabled = !hasFiles;
        addMoreBtn.disabled = this.files.length === 0;
    }

    async mergeFiles() {
        if (this.files.length < 2) return;

        const btn = document.getElementById('mergeBtn');
        const originalText = btn.textContent;
        btn.textContent = 'Merging...';
        btn.disabled = true;

        try {
            // Perform merge
            const mergedBytes = await pdfProcessor.mergePDFs(this.files);
            const filename = `merged_${new Date().toISOString().slice(0, 10)}.pdf`; // Simplified timestamp

            // Download
            pdfProcessor.downloadFile(mergedBytes, filename);

            // Save to history
            await storage.addToHistory({
                fileName: filename,
                tool: 'merge-pdf',
                size: this.formatSize(mergedBytes.byteLength),
                status: 'success'
            });

            notifications.success('PDFs merged successfully!');

        } catch (error) {
            console.error('Merge failed:', error);
            notifications.error('Failed to merge PDFs: ' + error.message);
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    formatSize(bytes) {
        if (!bytes) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
}

// Expose instance for HTML inline events
new MergeTool();
