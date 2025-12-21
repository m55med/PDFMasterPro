import { i18n } from '../../utils/i18n.js';
import { storage } from '../../utils/storage.js';
import { LangSelector } from '../../dashboard/components/lang-selector.js';

class DocumentsPage {
    constructor() {
        this.documents = [];
        this.filteredDocs = [];
        this.viewMode = 'grid'; // grid or list
        this.sortBy = 'date'; // date, name, size

        this.langSelector = new LangSelector();
    }

    async init() {
        // Initialize i18n
        i18n.init();

        // Initialize theme
        this.initTheme();

        // Load documents
        await this.loadDocuments();

        // Bind events
        this.bindEvents();

        // Render documents
        this.renderDocuments();
    }

    initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.dataset.theme = savedTheme;

        themeToggle?.addEventListener('click', () => {
            const currentTheme = document.documentElement.dataset.theme;
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = newTheme;
            localStorage.setItem('theme', newTheme);
        });
    }

    async loadDocuments() {
        try {
            // Load both files and history for a complete view
            const [files, history] = await Promise.all([
                storage.getAllFiles(),
                storage.getHistory()
            ]);

            // Map history for quick lookup by ID
            const historyMap = new Map();
            history.forEach(h => historyMap.set(h.id, h));

            this.documents = files.map(file => {
                const historyItem = historyMap.get(file.id);
                return {
                    id: file.id,
                    name: file.name,
                    date: file.date || (historyItem ? historyItem.date : new Date().toISOString()),
                    size: file.size || (historyItem ? historyItem.size : 0),
                    tool: historyItem ? historyItem.tool : 'upload',
                    preview: null
                };
            });

            this.filteredDocs = [...this.documents];
            this.sortDocuments();
        } catch (error) {
            console.error('Failed to load documents:', error);
            this.documents = [];
            this.filteredDocs = [];
        }
    }

    bindEvents() {
        // Search
        const searchInput = document.getElementById('searchDocs');
        searchInput?.addEventListener('input', (e) => {
            this.searchDocuments(e.target.value);
        });

        // Sort
        const sortSelect = document.getElementById('sortBy');
        sortSelect?.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.sortDocuments();
            this.renderDocuments();
        });

        // View toggle
        const viewToggle = document.getElementById('viewToggle');
        viewToggle?.addEventListener('click', () => {
            this.toggleView();
        });

        // Sidebar toggle (mobile)
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        menuToggle?.addEventListener('click', () => {
            sidebar?.classList.toggle('open');
        });
    }

    searchDocuments(query) {
        const lowerQuery = query.toLowerCase();

        if (!query) {
            this.filteredDocs = [...this.documents];
        } else {
            this.filteredDocs = this.documents.filter(doc =>
                doc.name.toLowerCase().includes(lowerQuery)
            );
        }

        this.renderDocuments();
    }

    sortDocuments() {
        this.filteredDocs.sort((a, b) => {
            switch (this.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'size':
                    return (b.size || 0) - (a.size || 0);
                case 'date':
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });
    }

    renderDocuments() {
        const grid = document.getElementById('documentsGrid');
        const emptyState = document.getElementById('emptyState');

        if (this.filteredDocs.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'flex';
            emptyState.style.flexDirection = 'column';
            emptyState.style.alignItems = 'center';
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        grid.innerHTML = this.filteredDocs.map(doc => this.createDocumentCard(doc)).join('');

        // Add event listeners to cards
        grid.querySelectorAll('.document-card').forEach(card => {
            const docId = card.dataset.id;

            card.querySelector('.doc-action-download')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.downloadDocument(docId);
            });

            card.querySelector('.doc-action-delete')?.addEventListener('click', async (e) => {
                e.stopPropagation();
                await this.deleteDocument(docId);
            });

            card.addEventListener('click', () => {
                this.openDocument(docId);
            });
        });
    }

    createDocumentCard(doc) {
        const date = new Date(doc.date).toLocaleDateString();
        const size = this.formatSize(doc.size);

        return `
            <div class="document-card" data-id="${doc.id}">
                <div class="doc-preview">
                    <div class="doc-preview-placeholder">
                        <svg viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                    </div>
                </div>
                <div class="doc-info">
                    <h4 title="${doc.name}">${doc.name}</h4>
                    <div class="doc-meta">
                        <span>📅 ${date}</span>
                        <span>📦 ${size}</span>
                    </div>
                </div>
                <div class="doc-actions">
                    <button class="doc-action-btn doc-action-download" title="Download">
                        💾 Download
                    </button>
                    <button class="doc-action-btn doc-action-delete" title="Delete">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }

    formatSize(bytes) {
        if (!bytes || bytes === 0) return '0 KB';
        const mb = bytes / (1024 * 1024);
        if (mb >= 1) {
            return `${mb.toFixed(1)} MB`;
        }
        const kb = bytes / 1024;
        return `${kb.toFixed(0)} KB`;
    }

    toggleView() {
        this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
        const grid = document.getElementById('documentsGrid');

        if (this.viewMode === 'list') {
            grid.style.gridTemplateColumns = '1fr';
        } else {
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
        }
    }

    async downloadDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc) return;

        try {
            const result = await storage.getResult(docId);
            if (result && result.blob) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(result.blob);
                link.download = doc.name;
                link.click();
                URL.revokeObjectURL(link.href);
            }
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download document');
        }
    }

    async deleteDocument(docId) {
        if (!confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            await storage.deleteHistoryItem(docId);
            await this.loadDocuments();
            this.renderDocuments();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete document');
        }
    }

    openDocument(docId) {
        // Open document in viewer (to be implemented)
        console.log('Open document:', docId);
    }
}

// Initialize page
const page = new DocumentsPage();
document.addEventListener('DOMContentLoaded', () => page.init());

export default page;

