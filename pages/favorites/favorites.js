import { i18n } from '../../utils/i18n.js';
import { storage } from '../../utils/storage.js';
import { LangSelector } from '../../dashboard/components/lang-selector.js';

class FavoritesPage {
    constructor() {
        this.favorites = [];
        this.filteredFavorites = [];
        this.langSelector = new LangSelector();
    }

    async init() {
        // Initialize i18n
        i18n.init();

        // Initialize theme
        this.initTheme();

        // Load favorites
        await this.loadFavorites();

        // Bind events
        this.bindEvents();

        // Render favorites
        this.renderFavorites();
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

    async loadFavorites() {
        try {
            // Get all documents
            const history = await storage.getHistory();
            
            // Filter favorites (stored in localStorage for now)
            const favIds = this.getFavoriteIds();
            
            this.favorites = history.filter(item => favIds.includes(item.id));
            this.filteredFavorites = [...this.favorites];
            
            // Update count
            this.updateCount();
        } catch (error) {
            console.error('Failed to load favorites:', error);
            this.favorites = [];
            this.filteredFavorites = [];
        }
    }

    getFavoriteIds() {
        const stored = localStorage.getItem('pdf_favorites');
        return stored ? JSON.parse(stored) : [];
    }

    saveFavoriteIds(ids) {
        localStorage.setItem('pdf_favorites', JSON.stringify(ids));
    }

    toggleFavorite(docId) {
        const favIds = this.getFavoriteIds();
        const index = favIds.indexOf(docId);
        
        if (index > -1) {
            favIds.splice(index, 1);
        } else {
            favIds.push(docId);
        }
        
        this.saveFavoriteIds(favIds);
        this.loadFavorites();
        this.renderFavorites();
    }

    updateCount() {
        const countEl = document.getElementById('favCount');
        if (countEl) {
            const count = this.favorites.length;
            countEl.textContent = `${count} favorite${count !== 1 ? 's' : ''}`;
        }
    }

    bindEvents() {
        // Search
        const searchInput = document.getElementById('searchDocs');
        searchInput?.addEventListener('input', (e) => {
            this.searchFavorites(e.target.value);
        });

        // Sidebar toggle (mobile)
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        menuToggle?.addEventListener('click', () => {
            sidebar?.classList.toggle('open');
        });
    }

    searchFavorites(query) {
        const lowerQuery = query.toLowerCase();
        
        if (!query) {
            this.filteredFavorites = [...this.favorites];
        } else {
            this.filteredFavorites = this.favorites.filter(doc => 
                doc.fileName.toLowerCase().includes(lowerQuery)
            );
        }

        this.renderFavorites();
    }

    renderFavorites() {
        const grid = document.getElementById('favoritesGrid');
        const emptyState = document.getElementById('emptyState');

        if (this.filteredFavorites.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'flex';
            emptyState.style.flexDirection = 'column';
            emptyState.style.alignItems = 'center';
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        grid.innerHTML = this.filteredFavorites.map(doc => this.createDocumentCard(doc)).join('');

        // Add event listeners
        grid.querySelectorAll('.document-card').forEach(card => {
            const docId = card.dataset.id;
            
            card.querySelector('.favorite-badge')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite(docId);
            });

            card.querySelector('.doc-action-download')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.downloadDocument(docId);
            });

            card.addEventListener('click', () => {
                this.openDocument(docId);
            });
        });
    }

    createDocumentCard(doc) {
        const date = new Date(doc.timestamp).toLocaleDateString();
        const size = this.formatSize(doc.fileSize);

        return `
            <div class="document-card" data-id="${doc.id}">
                <div class="favorite-badge is-favorite" title="Remove from favorites">
                    <svg viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </div>
                <div class="doc-preview">
                    <div class="doc-preview-placeholder">
                        <svg viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                    </div>
                </div>
                <div class="doc-info">
                    <h4 title="${doc.fileName}">${doc.fileName}</h4>
                    <div class="doc-meta">
                        <span>${date}</span>
                        <span>${size}</span>
                    </div>
                </div>
                <div class="doc-actions">
                    <button class="doc-action-btn doc-action-download" title="Download">
                        Download
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

    async downloadDocument(docId) {
        const doc = this.favorites.find(d => d.id === docId);
        if (!doc) return;

        try {
            const result = await storage.getResult(docId);
            if (result && result.blob) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(result.blob);
                link.download = doc.fileName;
                link.click();
                URL.revokeObjectURL(link.href);
            }
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download document');
        }
    }

    openDocument(docId) {
        console.log('Open document:', docId);
        // Navigate to document viewer
    }
}

// Initialize page
const page = new FavoritesPage();
document.addEventListener('DOMContentLoaded', () => page.init());

export default page;

