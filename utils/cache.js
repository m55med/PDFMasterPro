// PDF Master Pro - Cache Management Utility

const CACHE_LIMIT = 500 * 1024 * 1024; // 500MB
const WARNING_THRESHOLD = 0.8; // 80%
const EXPIRY_HOURS = 24;

class CacheManager {
    constructor(storage) {
        this.storage = storage;
        this.warningShown = false;
    }

    // Initialize cache manager
    async init() {
        // Clean expired files on init
        await this.cleanExpired();

        // Check capacity
        await this.checkCapacity();

        // Schedule periodic cleanup
        this.scheduleCleanup();

        return this;
    }

    // Schedule periodic cleanup (every hour)
    scheduleCleanup() {
        setInterval(async () => {
            await this.cleanExpired();
            await this.checkCapacity();
        }, 60 * 60 * 1000); // Every hour
    }

    // Clean expired files
    async cleanExpired() {
        try {
            const count = await this.storage.cleanExpiredFiles();
            if (count > 0) {
                console.log(`Cleaned ${count} expired files from cache`);
            }
            return count;
        } catch (error) {
            console.error('Failed to clean expired files:', error);
            return 0;
        }
    }

    // Check storage capacity
    async checkCapacity() {
        try {
            const used = await this.storage.getStorageUsed();
            const percentage = used / CACHE_LIMIT;

            if (percentage >= WARNING_THRESHOLD && !this.warningShown) {
                this.warningShown = true;
                this.showWarning(used, CACHE_LIMIT);
            }

            if (percentage >= 1) {
                // Cache is full, clean oldest files
                await this.cleanOldest();
            }

            return {
                used,
                limit: CACHE_LIMIT,
                percentage: percentage * 100,
                available: CACHE_LIMIT - used
            };
        } catch (error) {
            console.error('Failed to check capacity:', error);
            return null;
        }
    }

    // Show warning notification
    showWarning(used, limit) {
        if (window.notifications) {
            window.notifications.show({
                type: 'warning',
                title: 'Storage Almost Full',
                message: `Cache is ${Math.round((used / limit) * 100)}% full. Consider clearing old files.`,
                duration: 6000
            });
        }
    }

    // Clean oldest files until under limit
    async cleanOldest() {
        try {
            await this.storage.ensureDB();

            const transaction = this.storage.db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            const index = store.index('timestamp');
            const request = index.openCursor();

            let removed = 0;
            let used = await this.storage.getStorageUsed();
            const targetUsage = CACHE_LIMIT * 0.7; // Clean until 70%

            return new Promise((resolve) => {
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor && used > targetUsage) {
                        used -= cursor.value.size || 0;
                        cursor.delete();
                        removed++;
                        cursor.continue();
                    } else {
                        console.log(`Cleaned ${removed} old files to free up space`);
                        resolve(removed);
                    }
                };
                request.onerror = () => resolve(0);
            });
        } catch (error) {
            console.error('Failed to clean oldest files:', error);
            return 0;
        }
    }

    // Get cache statistics
    async getStats() {
        try {
            await this.storage.ensureDB();

            const transaction = this.storage.db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            const request = store.getAll();

            return new Promise((resolve) => {
                request.onsuccess = () => {
                    const files = request.result || [];
                    const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);

                    resolve({
                        fileCount: files.length,
                        totalSize,
                        usedPercentage: (totalSize / CACHE_LIMIT) * 100,
                        limit: CACHE_LIMIT,
                        available: CACHE_LIMIT - totalSize,
                        oldestFile: files.length > 0 ?
                            new Date(Math.min(...files.map(f => f.timestamp))) : null,
                        newestFile: files.length > 0 ?
                            new Date(Math.max(...files.map(f => f.timestamp))) : null
                    });
                };
                request.onerror = () => resolve(null);
            });
        } catch (error) {
            console.error('Failed to get cache stats:', error);
            return null;
        }
    }

    // Clear all cache
    async clearAll() {
        try {
            await this.storage.ensureDB();

            const transaction = this.storage.db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');

            return new Promise((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => {
                    this.warningShown = false;
                    resolve(true);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Failed to clear cache:', error);
            throw error;
        }
    }

    // Format size for display
    formatSize(bytes) {
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
}

// Export for use
window.CacheManager = CacheManager;

export default CacheManager;
export { CacheManager, CACHE_LIMIT, WARNING_THRESHOLD, EXPIRY_HOURS };
