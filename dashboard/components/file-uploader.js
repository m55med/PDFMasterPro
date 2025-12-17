// File Uploader Component
import { storage } from '../../utils/storage.js';
import { notifications } from '../../utils/notifications.js';

export class FileUploader {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.progressArea = document.getElementById('uploadProgress');
        this.progressBar = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
    }

    init() {
        if (!this.uploadArea || !this.fileInput) return;
        this.bindEvents();
    }

    bindEvents() {
        // Click to upload
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFiles(e.target.files);
            }
        });

        // Drag & Drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => {
                this.uploadArea.classList.remove('drag-over');
            });
        });

        this.uploadArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            this.handleFiles(files);
        });
    }

    async handleFiles(fileList) {
        const files = Array.from(fileList);

        // Filter supported files
        const supportedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            // Allow Office files but they might fail processing if libs aren't ready
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ];

        // Filter logic
        const validFiles = files.filter(file => {
            // Basic check, can be expanded
            return true;
        });

        if (validFiles.length === 0) return;

        // Show progress
        this.progressArea.hidden = false;
        this.progressArea.style.display = 'block';

        try {
            let processed = 0;

            for (const file of validFiles) {
                // Update progress text
                this.progressText.textContent = `Uploading ${file.name}...`;

                // Save to IndexedDB
                await storage.saveFile(file);

                processed++;
                const percent = (processed / validFiles.length) * 100;
                this.progressBar.style.width = `${percent}%`;
            }

            notifications.success(`Successfully uploaded ${processed} files`);

            // Reset after delay
            setTimeout(() => {
                this.progressArea.hidden = true;
                this.progressArea.style.display = 'none';
                this.progressBar.style.width = '0%';
                this.fileInput.value = ''; // Reset input

                // Trigger specific tool if needed
                // For now, we assume user uploads files then selects a tool
                // Or we could auto-redirect to merge if multiple PDFs
            }, 1500);

        } catch (error) {
            console.error('Upload failed:', error);
            notifications.error('Failed to upload files');
            this.progressArea.hidden = true;
        }
    }
}
