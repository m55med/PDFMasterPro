// PDF Master Pro - IndexedDB Storage Utility

const DB_NAME = 'PDFMasterPro';
const DB_VERSION = 1;

// Store names
const STORES = {
    FILES: 'files',
    HISTORY: 'history',
    SETTINGS: 'settings',
    FAVORITES: 'favorites'
};

class PDFStorage {
    constructor() {
        this.db = null;
    }

    // Initialize database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Files store - temporary file storage
                if (!db.objectStoreNames.contains(STORES.FILES)) {
                    const filesStore = db.createObjectStore(STORES.FILES, { keyPath: 'id' });
                    filesStore.createIndex('timestamp', 'timestamp', { unique: false });
                    filesStore.createIndex('expiresAt', 'expiresAt', { unique: false });
                }

                // History store - processing history
                if (!db.objectStoreNames.contains(STORES.HISTORY)) {
                    const historyStore = db.createObjectStore(STORES.HISTORY, { keyPath: 'id' });
                    historyStore.createIndex('date', 'date', { unique: false });
                    historyStore.createIndex('tool', 'tool', { unique: false });
                    historyStore.createIndex('status', 'status', { unique: false });
                }

                // Settings store - user preferences
                if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                    db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
                }

                // Favorites store - favorite tools
                if (!db.objectStoreNames.contains(STORES.FAVORITES)) {
                    const favStore = db.createObjectStore(STORES.FAVORITES, { keyPath: 'toolId' });
                    favStore.createIndex('addedAt', 'addedAt', { unique: false });
                }
            };
        });
    }

    // Ensure DB is initialized
    async ensureDB() {
        if (!this.db) {
            await this.init();
        }
        return this.db;
    }

    // ==================== FILES ====================

    // Save file to storage
    async saveFile(file, options = {}) {
        await this.ensureDB();

        const id = options.id || this.generateId();
        const expiryHours = options.expiryHours || 24;

        const fileData = {
            id,
            name: file.name,
            type: file.type,
            size: file.size,
            data: await this.fileToArrayBuffer(file),
            timestamp: Date.now(),
            expiresAt: Date.now() + (expiryHours * 60 * 60 * 1000)
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.FILES], 'readwrite');
            const store = transaction.objectStore(STORES.FILES);
            const request = store.put(fileData);

            request.onsuccess = () => resolve(id);
            request.onerror = () => reject(request.error);
        });
    }

    // Get file from storage
    async getFile(id) {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.FILES], 'readonly');
            const store = transaction.objectStore(STORES.FILES);
            const request = store.get(id);

            request.onsuccess = () => {
                const data = request.result;
                if (data) {
                    // Convert ArrayBuffer back to File
                    const blob = new Blob([data.data], { type: data.type });
                    const file = new File([blob], data.name, { type: data.type });
                    resolve({ ...data, file });
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Delete file from storage
    async deleteFile(id) {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.FILES], 'readwrite');
            const store = transaction.objectStore(STORES.FILES);
            const request = store.delete(id);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // Clean expired files
    async cleanExpiredFiles() {
        await this.ensureDB();
        const now = Date.now();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.FILES], 'readwrite');
            const store = transaction.objectStore(STORES.FILES);
            const index = store.index('expiresAt');
            const range = IDBKeyRange.upperBound(now);
            const request = index.openCursor(range);

            let deletedCount = 0;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    deletedCount++;
                    cursor.continue();
                } else {
                    resolve(deletedCount);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    // ==================== HISTORY ====================

    // Add to history
    async addToHistory(entry) {
        await this.ensureDB();

        const historyEntry = {
            id: entry.id || this.generateId(),
            fileName: entry.fileName,
            tool: entry.tool,
            size: entry.size,
            date: entry.date || new Date().toISOString(),
            status: entry.status || 'success',
            downloadUrl: entry.downloadUrl || null,
            inputFiles: entry.inputFiles || [],
            outputFile: entry.outputFile || null
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.HISTORY], 'readwrite');
            const store = transaction.objectStore(STORES.HISTORY);
            const request = store.put(historyEntry);

            request.onsuccess = () => resolve(historyEntry.id);
            request.onerror = () => reject(request.error);
        });
    }

    // Get history entries
    async getHistory(options = {}) {
        await this.ensureDB();
        const { limit = 50, tool = null, status = null } = options;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.HISTORY], 'readonly');
            const store = transaction.objectStore(STORES.HISTORY);
            const request = store.getAll();

            request.onsuccess = () => {
                let results = request.result || [];

                // Filter by tool if specified
                if (tool) {
                    results = results.filter(h => h.tool === tool);
                }

                // Filter by status if specified
                if (status) {
                    results = results.filter(h => h.status === status);
                }

                // Sort by date descending
                results.sort((a, b) => new Date(b.date) - new Date(a.date));

                // Limit results
                results = results.slice(0, limit);

                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Clear history
    async clearHistory() {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.HISTORY], 'readwrite');
            const store = transaction.objectStore(STORES.HISTORY);
            const request = store.clear();

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // Delete single history entry
    async deleteHistoryEntry(id) {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.HISTORY], 'readwrite');
            const store = transaction.objectStore(STORES.HISTORY);
            const request = store.delete(id);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // ==================== SETTINGS ====================

    // Get setting
    async getSetting(key, defaultValue = null) {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.SETTINGS], 'readonly');
            const store = transaction.objectStore(STORES.SETTINGS);
            const request = store.get(key);

            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : defaultValue);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Set setting
    async setSetting(key, value) {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.SETTINGS], 'readwrite');
            const store = transaction.objectStore(STORES.SETTINGS);
            const request = store.put({ key, value });

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // Get all settings
    async getAllSettings() {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.SETTINGS], 'readonly');
            const store = transaction.objectStore(STORES.SETTINGS);
            const request = store.getAll();

            request.onsuccess = () => {
                const results = request.result || [];
                const settings = {};
                results.forEach(item => {
                    settings[item.key] = item.value;
                });
                resolve(settings);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // ==================== FAVORITES ====================

    // Add favorite tool
    async addFavorite(toolId) {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.FAVORITES], 'readwrite');
            const store = transaction.objectStore(STORES.FAVORITES);
            const request = store.put({ toolId, addedAt: Date.now() });

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // Remove favorite tool
    async removeFavorite(toolId) {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.FAVORITES], 'readwrite');
            const store = transaction.objectStore(STORES.FAVORITES);
            const request = store.delete(toolId);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // Get all favorites
    async getFavorites() {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.FAVORITES], 'readonly');
            const store = transaction.objectStore(STORES.FAVORITES);
            const request = store.getAll();

            request.onsuccess = () => {
                const results = request.result || [];
                resolve(results.map(f => f.toolId));
            };
            request.onerror = () => reject(request.error);
        });
    }

    // ==================== UTILITIES ====================

    // Generate unique ID
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Convert File to ArrayBuffer
    async fileToArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
        });
    }

    // Get total storage used
    async getStorageUsed() {
        await this.ensureDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.FILES], 'readonly');
            const store = transaction.objectStore(STORES.FILES);
            const request = store.getAll();

            request.onsuccess = () => {
                const files = request.result || [];
                const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
                resolve(totalSize);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Clear all data
    async clearAll() {
        await this.ensureDB();

        const stores = Object.values(STORES);

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(stores, 'readwrite');

            stores.forEach(storeName => {
                transaction.objectStore(storeName).clear();
            });

            transaction.oncomplete = () => resolve(true);
            transaction.onerror = () => reject(transaction.error);
        });
    }
}

// Create singleton instance
const storage = new PDFStorage();

// Export for use in other modules
window.PDFStorage = PDFStorage;
window.storage = storage;

export default storage;
export { PDFStorage, storage, STORES };
