// PDF Master Pro - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize popup
    initVersion();
    initToolButtons();
    initDashboardButton();
    loadRecentFiles();
});

// Get and display version
async function initVersion() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getVersion' });
        if (response && response.version) {
            document.getElementById('version').textContent = `v${response.version}`;
        }
    } catch (error) {
        console.error('Failed to get version:', error);
    }
}

// Initialize tool buttons
function initToolButtons() {
    const toolButtons = document.querySelectorAll('.tool-btn');

    toolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tool = btn.dataset.tool;
            openTool(tool);
        });
    });
}

// Open specific tool page
async function openTool(toolName) {
    try {
        // Map tool names to their paths
        const toolPaths = {
            'merge': 'tools/merge/index.html',
            'split': 'tools/split/index.html',
            'compress': 'tools/compress/index.html',
            'convert': 'tools/convert/index.html',
            'protect': 'tools/protect/index.html',
            'rotate': 'tools/rotate/index.html'
        };

        const path = toolPaths[toolName] || `tools/${toolName}/index.html`;

        // Open tool in new tab
        await chrome.tabs.create({
            url: chrome.runtime.getURL(path)
        });

        // Close popup
        window.close();
    } catch (error) {
        console.error('Failed to open tool:', error);
    }
}

// Initialize dashboard button
function initDashboardButton() {
    const dashboardBtn = document.getElementById('openDashboard');

    dashboardBtn.addEventListener('click', async () => {
        try {
            await chrome.tabs.create({
                url: chrome.runtime.getURL('dashboard/index.html')
            });
            window.close();
        } catch (error) {
            console.error('Failed to open dashboard:', error);
        }
    });
}

// Load recent files from storage
async function loadRecentFiles() {
    const container = document.getElementById('recentFiles');

    try {
        const result = await chrome.storage.local.get('recentFiles');
        const files = result.recentFiles || [];

        if (files.length === 0) {
            container.innerHTML = `
        <div class="empty-state">
          <p>No recent files</p>
        </div>
      `;
            return;
        }

        // Show last 3 files
        const recentFiles = files.slice(0, 3);

        container.innerHTML = recentFiles.map(file => `
      <div class="file-item" data-id="${file.id}">
        <div class="file-icon">PDF</div>
        <div class="file-info">
          <div class="file-name">${escapeHtml(file.name)}</div>
          <div class="file-meta">${formatSize(file.size)} • ${formatDate(file.date)}</div>
        </div>
      </div>
    `).join('');

        // Add click handlers
        container.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', () => {
                const fileId = item.dataset.id;
                openFileInDashboard(fileId);
            });
        });

    } catch (error) {
        console.error('Failed to load recent files:', error);
        container.innerHTML = `
      <div class="empty-state">
        <p>No recent files</p>
      </div>
    `;
    }
}

// Open file in dashboard
async function openFileInDashboard(fileId) {
    try {
        await chrome.tabs.create({
            url: chrome.runtime.getURL(`dashboard/index.html?file=${fileId}`)
        });
        window.close();
    } catch (error) {
        console.error('Failed to open file:', error);
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatSize(bytes) {
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

function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // Less than 24 hours
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) {
            const minutes = Math.floor(diff / 60000);
            return minutes < 1 ? 'Just now' : `${minutes}m ago`;
        }
        return `${hours}h ago`;
    }

    // Less than 7 days
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days}d ago`;
    }

    // Format as date
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}
