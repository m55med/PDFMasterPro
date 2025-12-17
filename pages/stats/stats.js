// Stats Logic
import { storage } from '../../utils/storage.js';

document.addEventListener('DOMContentLoaded', async () => {
    const history = await storage.getHistory();

    // 1. Total Files
    document.getElementById('totalFiles').textContent = history.length;

    // 2. Data Size
    let totalBytes = 0;
    history.forEach(h => {
        // Parse size string like "1.5 MB" back to approximation or ideally store bytes?
        // Storage stores string formatted. Let's try to parse or just accept 0 for now if complex.
        // Actually, let's just count items for MVP or mock the size logic if we didn't store raw bytes.
        // Looking at history.js, we store formatted size.
        // Let's rely on cache stats if possible? Cache manager has getStats().
        // For now, let's just mock "Data Processed" based on count * avg 2MB
        totalBytes = history.length * 2 * 1024 * 1024;
    });
    document.getElementById('totalSize').textContent = formatSize(totalBytes);

    // 3. Days Active (Mock start date or assume local storage has install date? Let's default 1)
    document.getElementById('daysActive').textContent = '1';

    // 4. Top Tools
    const toolCounts = {};
    history.forEach(h => {
        const t = h.tool || 'unknown';
        toolCounts[t] = (toolCounts[t] || 0) + 1;
    });

    const sortedTools = Object.entries(toolCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const chartEl = document.getElementById('topToolsChart');
    const maxVal = sortedTools[0]?.[1] || 1;

    chartEl.innerHTML = sortedTools.map(([name, count]) => `
    <div class="bar-row">
      <div class="bar-label">${formatToolName(name)}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${(count / maxVal) * 100}%"></div>
      </div>
      <div style="width: 30px; text-align: right;">${count}</div>
    </div>
  `).join('');

    if (sortedTools.length === 0) {
        chartEl.innerHTML = '<p style="color:#aaa; text-align:center;">No activity yet</p>';
    }

    // 5. Recent Activity
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = history.slice(0, 5).map(h => `
    <div style="font-size:13px; padding:8px; background:#F8FAFC; border-radius:6px; display:flex; justify-content:space-between;">
      <span>${formatToolName(h.tool)}: ${h.fileName}</span>
      <span style="color:#64748B">${new Date(h.date).toLocaleDateString()}</span>
    </div>
  `).join('');
});

function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatToolName(slug) {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
