import { i18n } from '../../utils/i18n.js';
import { LangSelector } from '../../dashboard/components/lang-selector.js';

class CollectionsPage {
    constructor() {
        this.collections = [];
        this.selectedColor = '#6366F1';
        this.editingCollection = null;
        this.langSelector = new LangSelector();
    }

    async init() {
        // Initialize i18n
        i18n.init();

        // Initialize theme
        this.initTheme();

        // Load collections
        this.loadCollections();

        // Bind events
        this.bindEvents();

        // Render collections
        this.renderCollections();
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

    loadCollections() {
        const stored = localStorage.getItem('pdf_collections');
        this.collections = stored ? JSON.parse(stored) : [];
    }

    saveCollections() {
        localStorage.setItem('pdf_collections', JSON.stringify(this.collections));
    }

    bindEvents() {
        // New collection button
        document.getElementById('newCollectionBtn')?.addEventListener('click', () => {
            this.openModal();
        });

        document.getElementById('createFirstCollection')?.addEventListener('click', () => {
            this.openModal();
        });

        // Modal controls
        document.getElementById('closeModal')?.addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelBtn')?.addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('saveCollectionBtn')?.addEventListener('click', () => {
            this.saveCollection();
        });

        // Close modal on background click
        document.getElementById('collectionModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'collectionModal') {
                this.closeModal();
            }
        });

        // Color picker
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedColor = btn.dataset.color;
            });
        });

        // Sidebar toggle (mobile)
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        menuToggle?.addEventListener('click', () => {
            sidebar?.classList.toggle('open');
        });

        // Enter key to save
        const nameInput = document.getElementById('collectionName');
        nameInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveCollection();
            }
        });
    }

    openModal(collection = null) {
        const modal = document.getElementById('collectionModal');
        const title = document.getElementById('modalTitle');
        const nameInput = document.getElementById('collectionName');
        const descInput = document.getElementById('collectionDesc');
        const saveBtn = document.getElementById('saveCollectionBtn');

        this.editingCollection = collection;

        if (collection) {
            title.textContent = 'Edit Collection';
            nameInput.value = collection.name;
            descInput.value = collection.description || '';
            this.selectedColor = collection.color;
            saveBtn.textContent = 'Save Changes';

            // Set active color
            document.querySelectorAll('.color-option').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.color === collection.color);
            });
        } else {
            title.textContent = 'New Collection';
            nameInput.value = '';
            descInput.value = '';
            this.selectedColor = '#6366F1';
            saveBtn.textContent = 'Create Collection';

            // Reset to default color
            document.querySelectorAll('.color-option').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.color === '#6366F1');
            });
        }

        modal.style.display = 'flex';
        setTimeout(() => nameInput.focus(), 100);
    }

    closeModal() {
        const modal = document.getElementById('collectionModal');
        modal.style.display = 'none';
        this.editingCollection = null;
    }

    saveCollection() {
        const nameInput = document.getElementById('collectionName');
        const descInput = document.getElementById('collectionDesc');
        const name = nameInput.value.trim();

        if (!name) {
            alert('Please enter a collection name');
            nameInput.focus();
            return;
        }

        if (this.editingCollection) {
            // Update existing collection
            this.editingCollection.name = name;
            this.editingCollection.description = descInput.value.trim();
            this.editingCollection.color = this.selectedColor;
            this.editingCollection.updatedAt = new Date().toISOString();
        } else {
            // Create new collection
            const collection = {
                id: Date.now().toString(),
                name: name,
                description: descInput.value.trim(),
                color: this.selectedColor,
                documents: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.collections.push(collection);
        }

        this.saveCollections();
        this.renderCollections();
        this.closeModal();
    }

    deleteCollection(collectionId) {
        const collection = this.collections.find(c => c.id === collectionId);
        if (!collection) return;

        const confirmed = confirm(`Are you sure you want to delete "${collection.name}"?`);
        if (!confirmed) return;

        this.collections = this.collections.filter(c => c.id !== collectionId);
        this.saveCollections();
        this.renderCollections();
    }

    renderCollections() {
        const grid = document.getElementById('collectionsGrid');
        const emptyState = document.getElementById('emptyState');

        if (this.collections.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'flex';
            emptyState.style.flexDirection = 'column';
            emptyState.style.alignItems = 'center';
            return;
        }

        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        grid.innerHTML = this.collections.map(collection => this.createCollectionCard(collection)).join('');

        // Add event listeners
        grid.querySelectorAll('.collection-card').forEach(card => {
            const collectionId = card.dataset.id;

            card.querySelector('.btn-edit')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const collection = this.collections.find(c => c.id === collectionId);
                this.openModal(collection);
            });

            card.querySelector('.btn-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteCollection(collectionId);
            });

            card.addEventListener('click', () => {
                this.openCollection(collectionId);
            });
        });
    }

    createCollectionCard(collection) {
        const docCount = collection.documents?.length || 0;
        const date = new Date(collection.updatedAt).toLocaleDateString();

        return `
            <div class="collection-card" data-id="${collection.id}" style="--collection-color: ${collection.color}">
                <div class="collection-header">
                    <div class="collection-icon" style="background: ${collection.color}">
                        <svg viewBox="0 0 24 24">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                    </div>
                    <div class="collection-info">
                        <h3>${collection.name}</h3>
                        ${collection.description ? `<p>${collection.description}</p>` : ''}
                    </div>
                </div>
                <div class="collection-stats">
                    <div class="collection-stat">
                        <strong>${docCount}</strong> document${docCount !== 1 ? 's' : ''}
                    </div>
                    <div class="collection-stat">
                        Updated ${date}
                    </div>
                </div>
                <div class="collection-actions">
                    <button class="collection-action-btn btn-edit" title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="collection-action-btn btn-delete" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    openCollection(collectionId) {
        // Navigate to collection view (to be implemented)
        console.log('Open collection:', collectionId);
        // window.location.href = `collection-view.html?id=${collectionId}`;
    }
}

// Initialize page
const page = new CollectionsPage();
document.addEventListener('DOMContentLoaded', () => page.init());

export default page;

