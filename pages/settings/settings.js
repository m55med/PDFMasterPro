// Settings Logic
import { storage } from '../../utils/storage.js';
import { notifications } from '../../utils/notifications.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Init toggles based on current state
    const isDark = document.body.dataset.theme === 'dark' || localStorage.getItem('theme') === 'dark';
    document.getElementById('darkModeToggle').checked = isDark;
    if (isDark) document.body.classList.add('dark-mode');

    // Load stored settings
    const settings = await storage.getSettings() || {};
    document.getElementById('notificationsToggle').checked = settings.notifications !== false; // Default true
    document.getElementById('autoCleanToggle').checked = settings.autoClean !== false; // Default true

    // Bind Events
    document.getElementById('darkModeToggle').addEventListener('change', (e) => {
        const isDark = e.target.checked;
        if (isDark) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
        // Broadcast theme change for other tabs if needed
        window.dispatchEvent(new Event('themeChanged'));
    });

    document.getElementById('notificationsToggle').addEventListener('change', async (e) => {
        await storage.saveSettings({ notifications: e.target.checked });
        notifications.success('Settings saved');
    });

    document.getElementById('autoCleanToggle').addEventListener('change', async (e) => {
        await storage.saveSettings({ autoClean: e.target.checked });
        notifications.success('Settings saved');
    });

    document.getElementById('clearDataBtn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to clear all data? This includes recent files, history, and settings.')) {
            try {
                await storage.clearAll();
                notifications.success('All data cleared successfully');
                setTimeout(() => location.reload(), 1000);
            } catch (err) {
                console.error(err);
                notifications.error('Failed to clear data');
            }
        }
    });

    // Set Version
    const manifest = chrome.runtime.getManifest();
    document.getElementById('versionNum').textContent = `v${manifest.version}`;
});
