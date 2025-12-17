// Recent Files Page

import { Sidebar } from '../../dashboard/components/sidebar.js';
import { i18n } from '../../utils/i18n.js';

class RecentFilesPage {
    constructor() {
        this.timeline = document.getElementById('recentTimeline');
        this.emptyState = document.getElementById('emptyState');
        this.searchInput = document.getElementById('recentSearch');
        this.clearBtn = document.getElementById('clearRecent');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.currentFilter = 'all';
        this.recentFiles = [];
    }

    async init() {
        this.loadRecentFiles();
        this.bindEvents();
        this.renderTimeline();

        // Initialize sidebar
        const sidebar = new Sidebar();
        sidebar.init();

        // Initialize i18n
        await i18n.init();
    }

    loadRecentFiles() {
        // Load from localStorage
        const stored = localStorage.getItem('recentFiles');
        this.recentFiles = stored ? JSON.parse(stored) : [];
    }

    saveRecentFiles() {
        localStorage.setItem('recentFiles', JSON.stringify(this.recentFiles));
    }

    bindEvents() {
        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.renderTimeline();
            });
        });

        // Search
        this.searchInput?.addEventListener('input', (e) => {
            this.renderTimeline(e.target.value);
        });

        // Clear button
        this.clearBtn?.addEventListener('click', () => {
            if (confirm('Clear all recent files history?')) {
                this.recentFiles = [];
                this.saveRecentFiles();
                this.renderTimeline();
            }
        });
    }

    filterByTime(files) {
        const now = Date.now();
        const day = 24 * 60 * 60 * 1000;

        switch (this.currentFilter) {
            case 'today':
                return files.filter(f => now - f.timestamp < day);
            case 'week':
                return files.filter(f => now - f.timestamp < 7 * day);
            case 'month':
                return files.filter(f => now - f.timestamp < 30 * day);
            default:
                return files;
        }
    }

    searchFiles(files, query) {
        if (!query) return files;
        const lowerQuery = query.toLowerCase();
        return files.filter(f => 
            f.name.toLowerCase().includes(lowerQuery) ||
            f.action?.toLowerCase().includes(lowerQuery)
        );
    }

    groupByDate(files) {
        const groups = {
            today: [],
            yesterday: [],
            thisWeek: [],
            older: []
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterday = today - 24 * 60 * 60 * 1000;
        const weekAgo = today - 7 * 24 * 60 * 60 * 1000;

        files.forEach(file => {
            if (file.timestamp >= today) {
                groups.today.push(file);
            } else if (file.timestamp >= yesterday) {
                groups.yesterday.push(file);
            } else if (file.timestamp >= weekAgo) {
                groups.thisWeek.push(file);
            } else {
                groups.older.push(file);
            }
        });

        return groups;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return date.toLocaleDateString();
    }

    createFileCard(file) {
        const card = document.createElement('div');
        card.className = 'recent-card';
        card.dataset.fileId = file.id;

        card.innerHTML = `
            <div class="recent-preview">
                <svg class="preview-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                </svg>
            </div>
            <div class="recent-info">
                <div class="recent-name" title="${file.name}">${file.name}</div>
                <div class="recent-meta">
                    <span class="recent-action">${file.action || 'Viewed'}</span>
                    <div class="recent-time">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>${this.formatTime(file.timestamp)}</span>
                    </div>
                </div>
            </div>
            <div class="recent-actions">
                <button class="action-btn" title="Open" data-action="open">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                </button>
                <button class="action-btn" title="Remove" data-action="remove">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;

        // Event listeners
        card.querySelector('[data-action="open"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openFile(file);
        });

        card.querySelector('[data-action="remove"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFile(file.id);
        });

        card.addEventListener('click', () => {
            this.openFile(file);
        });

        return card;
    }

    renderTimeline(searchQuery = '') {
        let files = [...this.recentFiles];
        files = this.filterByTime(files);
        files = this.searchFiles(files, searchQuery);

        if (files.length === 0) {
            this.timeline.style.display = 'none';
            this.emptyState.style.display = 'block';
            return;
        }

        this.timeline.style.display = 'flex';
        this.emptyState.style.display = 'none';
        this.timeline.innerHTML = '';

        const groups = this.groupByDate(files);
        const groupLabels = {
            today: 'Today',
            yesterday: 'Yesterday',
            thisWeek: 'This Week',
            older: 'Older'
        };

        Object.entries(groups).forEach(([key, groupFiles]) => {
            if (groupFiles.length === 0) return;

            const groupEl = document.createElement('div');
            groupEl.className = 'timeline-group';

            const header = document.createElement('div');
            header.className = 'timeline-header';
            header.textContent = groupLabels[key];
            groupEl.appendChild(header);

            const items = document.createElement('div');
            items.className = 'timeline-items';
            groupFiles.forEach(file => {
                items.appendChild(this.createFileCard(file));
            });
            groupEl.appendChild(items);

            this.timeline.appendChild(groupEl);
        });
    }

    openFile(file) {
        console.log('Opening file:', file);
        // Navigate to appropriate tool
        if (file.toolUrl) {
            window.location.href = file.toolUrl;
        }
    }

    removeFile(fileId) {
        this.recentFiles = this.recentFiles.filter(f => f.id !== fileId);
        this.saveRecentFiles();
        this.renderTimeline(this.searchInput?.value || '');
    }
}

// Initialize page
const page = new RecentFilesPage();
page.init();

// Export for external use
export { RecentFilesPage };

