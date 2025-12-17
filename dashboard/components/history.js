// History Component
import { storage } from '../../utils/storage.js';
import { notifications } from '../../utils/notifications.js';

export class History {
    constructor() {
        this.tableBody = document.getElementById('historyBody');
        this.sortSelect = document.getElementById('historySort');
        this.clearBtn = document.getElementById('clearHistory');
    }

    async init() {
        if (!this.tableBody) return;

        this.bindEvents();
        await this.loadHistory();
    }

    bindEvents() {
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', () => this.loadHistory());
        }

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearAllHistory());
        }
    }

    async loadHistory() {
        if (!this.tableBody) return;

        try {
            const entries = await storage.getHistory({ limit: 10 });

            // Sort handling
            if (this.sortSelect) {
                const sortMode = this.sortSelect.value;
                if (sortMode === 'name') {
                    entries.sort((a, b) => a.fileName.localeCompare(b.fileName));
                } else if (sortMode === 'size') {
                    entries.sort((a, b) => this.parseSize(b.size) - this.parseSize(a.size));
                }
                // default is 'recent' which is already date sorted from storage
            }

            this.render(entries);

        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }

    render(entries) {
        if (entries.length === 0) {
            this.tableBody.innerHTML = `
        <tr class="empty-row">
          <td colspan="6">
            <div class="empty-history">
              <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p>No processing history yet</p>
              <span>Your processed files will appear here</span>
            </div>
          </td>
        </tr>
      `;
            return;
        }

        this.tableBody.innerHTML = entries.map(entry => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #ef4444;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span title="${entry.fileName}" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${entry.fileName}
            </span>
          </div>
        </td>
        <td>${this.formatToolName(entry.tool)}</td>
        <td>${entry.size || '-'}</td>
        <td>${this.formatDate(entry.date)}</td>
        <td>
          <span class="status-badge ${entry.status === 'success' ? 'status-success' : 'status-failed'}">
            ${entry.status}
          </span>
        </td>
        <td>
          ${entry.downloadUrl ? `<button class="action-btn" onclick="window.open('${entry.downloadUrl}')">Download</button>` : ''}
          <button class="action-btn" style="background:none; border:1px solid #e2e8f0;" data-id="${entry.id}">Delete</button>
        </td>
      </tr>
    `).join('');

        // Attach delete listeners
        this.tableBody.querySelectorAll('button[data-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.deleteEntry(id);
            });
        });
    }

    async deleteEntry(id) {
        try {
            await storage.deleteHistoryEntry(id);
            this.loadHistory();
            notifications.success('History entry deleted');
        } catch (error) {
            notifications.error('Failed to delete entry');
        }
    }

    async clearAllHistory() {
        if (confirm('Are you sure you want to clear all history?')) {
            await storage.clearHistory();
            this.loadHistory();
            notifications.success('History cleared');
        }
    }

    // Helpers
    formatToolName(tool) {
        if (!tool) return 'Unknown';
        // capitalize and replace hyphens
        return tool.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    parseSize(sizeStr) {
        if (!sizeStr) return 0;
        const num = parseFloat(sizeStr);
        if (sizeStr.includes('GB')) return num * 1024 * 1024 * 1024;
        if (sizeStr.includes('MB')) return num * 1024 * 1024;
        if (sizeStr.includes('KB')) return num * 1024;
        return num;
    }
}
