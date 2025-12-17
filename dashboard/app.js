// PDF Master Pro - Dashboard App Entry Point

import { Sidebar } from './components/sidebar.js';
import { FileUploader } from './components/file-uploader.js';
import { ToolCards } from './components/tool-cards.js';
import { History } from './components/history.js';
import { LangSelector } from './components/lang-selector.js';
import { storage } from '../utils/storage.js';
import { notifications } from '../utils/notifications.js';
import { i18n } from '../utils/i18n.js';

class DashboardApp {
    constructor() {
        this.sidebar = new Sidebar();
        this.fileUploader = new FileUploader();
        this.toolCards = new ToolCards();
        this.history = new History();
        this.langSelector = new LangSelector();

        // Components config
        this.components = [
            this.sidebar,
            this.fileUploader,
            this.toolCards,
            this.history,
            this.langSelector
        ];
    }

    async init() {
        try {
            console.log('Initializing Dashboard App...');

            // Initialize DB first
            await storage.init();

            // Initialize i18n
            i18n.init();

            // Initialize all components
            for (const component of this.components) {
                if (component.init) {
                    await component.init();
                }
            }

            // Global event listeners
            this.bindGlobalEvents();

            // Load initial data
            await this.loadStats();
            this.updateStorageDisplay();

            // Handle URL parameters (e.g. open specific tool from context menu)
            this.handleUrlParams();

            console.log('Dashboard initialized successfully!');

        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            notifications.error('Failed to load dashboard. Please reload.');
        }
    }

    bindGlobalEvents() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());

            // Load saved theme
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                document.documentElement.dataset.theme = savedTheme;
            } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.dataset.theme = 'dark';
            }
        }

        // Sidebar toggle (mobile)
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });

            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 &&
                    sidebar.classList.contains('open') &&
                    !sidebar.contains(e.target) &&
                    !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                this.toolCards.filterTools(query);
            });
        }

        // Listen for file processing events to update history and stats
        window.addEventListener('file-processed', () => {
            this.history.loadHistory();
            this.loadStats();
            this.updateStorageDisplay();
        });
    }

    toggleTheme() {
        const current = document.documentElement.dataset.theme;
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        localStorage.setItem('theme', next);
    }

    async loadStats() {
        try {
            const allHistory = await storage.getHistory();
            const count = allHistory.length;

            const countEl = document.getElementById('statsCount');
            if (countEl) countEl.textContent = count;

            // Animate circle
            const maxFiles = 100; // Goal
            const percentage = Math.min((count / maxFiles) * 100, 100);
            const circle = document.getElementById('statsCircle');
            if (circle) {
                circle.style.strokeDasharray = `${percentage}, 100`;
            }

        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    async updateStorageDisplay() {
        try {
            const used = await storage.getStorageUsed();
            const limit = 500 * 1024 * 1024; // 500MB
            const percentage = (used / limit) * 100;

            const usedEl = document.getElementById('storageUsed');
            const fillEl = document.getElementById('storageFill');

            if (usedEl) usedEl.textContent = this.formatSize(used);
            if (fillEl) fillEl.style.width = `${percentage}%`;

        } catch (error) {
            console.error('Failed to update storage display:', error);
        }
    }

    handleUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const pdfUrl = params.get('pdf');
        const fileId = params.get('file');

        if (pdfUrl) {
            // Handle PDF URL from context menu
            // TODO: Download logic to be implemented
            notifications.info('Opening PDF from URL is coming soon!');
        }

        if (fileId) {
            // Highlight file in history
            // TODO: Implementation for focusing on a file
        }
    }

    formatSize(bytes) {
        if (!bytes) return '0 MB';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)} MB`;
    }
}

// Start app
const app = new DashboardApp();
document.addEventListener('DOMContentLoaded', () => app.init());

export default app;
