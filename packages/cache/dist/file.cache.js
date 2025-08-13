"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDexNameSpaceLocalCache = exports.getDexNamespaceLocalCache = exports.defaultFileCache = exports.FileCacheManager = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class FileCacheManager {
    constructor(localCacheDir = "./GraphData") {
        this.localCacheDir = localCacheDir;
    }
    /**
     * Ensure the directory exists before performing any operations
     */
    ensureDirExists(dexId) {
        const DIR = path_1.default.join(this.localCacheDir, dexId);
        if (!fs_1.default.existsSync(DIR)) {
            fs_1.default.mkdirSync(DIR, { recursive: true }); // Create the directory
        }
        return DIR;
    }
    /**
     * Get the file path for a specific dex and namespace
     */
    getFilePath(dexId, namespace) {
        const dexDir = this.ensureDirExists(dexId);
        return path_1.default.join(dexDir, `${namespace}.json`);
    }
    /**
     * Get data from local file cache
     */
    getDexNamespaceLocalCache(dexId, nameSpace) {
        const filePath = this.getFilePath(dexId, nameSpace);
        if (!fs_1.default.existsSync(filePath)) {
            return null;
        }
        try {
            const data = JSON.parse(fs_1.default.readFileSync(filePath, "utf8"));
            return data;
        }
        catch (err) {
            console.error(`Error reading file cache for ${dexId}:${nameSpace}:`, err);
            return null;
        }
    }
    /**
     * Set data in local file cache
     */
    setDexNameSpaceLocalCache(dexId, namespace, serializedData) {
        try {
            const filePath = this.getFilePath(dexId, namespace);
            fs_1.default.writeFileSync(filePath, serializedData, "utf8");
        }
        catch (err) {
            console.error(`Error writing file cache for ${dexId}:${namespace}:`, err);
        }
    }
    /**
     * Delete data from local file cache
     */
    deleteDexNamespaceLocalCache(dexId, namespace) {
        try {
            const filePath = this.getFilePath(dexId, namespace);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        catch (err) {
            console.error(`Error deleting file cache for ${dexId}:${namespace}:`, err);
        }
    }
    /**
     * Check if data exists in local file cache
     */
    existsDexNamespaceLocalCache(dexId, namespace) {
        const filePath = this.getFilePath(dexId, namespace);
        return fs_1.default.existsSync(filePath);
    }
    /**
     * Clear all cache files for a specific dex
     */
    clearDexCache(dexId) {
        try {
            const dexDir = path_1.default.join(this.localCacheDir, dexId);
            if (fs_1.default.existsSync(dexDir)) {
                const files = fs_1.default.readdirSync(dexDir);
                files.forEach(file => {
                    const filePath = path_1.default.join(dexDir, file);
                    fs_1.default.unlinkSync(filePath);
                });
                fs_1.default.rmdirSync(dexDir);
            }
        }
        catch (err) {
            console.error(`Error clearing dex cache for ${dexId}:`, err);
        }
    }
    /**
     * Clear all cache files
     */
    clearAllCache() {
        try {
            if (fs_1.default.existsSync(this.localCacheDir)) {
                const dexDirs = fs_1.default.readdirSync(this.localCacheDir);
                dexDirs.forEach(dexDir => {
                    const dexPath = path_1.default.join(this.localCacheDir, dexDir);
                    if (fs_1.default.statSync(dexPath).isDirectory()) {
                        this.clearDexCache(dexDir);
                    }
                });
            }
        }
        catch (err) {
            console.error("Error clearing all file cache:", err);
        }
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        let totalFiles = 0;
        let totalSizeBytes = 0;
        let totalDexes = 0;
        try {
            if (fs_1.default.existsSync(this.localCacheDir)) {
                const dexDirs = fs_1.default.readdirSync(this.localCacheDir);
                dexDirs.forEach(dexDir => {
                    const dexPath = path_1.default.join(this.localCacheDir, dexDir);
                    if (fs_1.default.statSync(dexPath).isDirectory()) {
                        totalDexes++;
                        const files = fs_1.default.readdirSync(dexPath);
                        files.forEach(file => {
                            const filePath = path_1.default.join(dexPath, file);
                            if (file.endsWith('.json')) {
                                totalFiles++;
                                const stats = fs_1.default.statSync(filePath);
                                totalSizeBytes += stats.size;
                            }
                        });
                    }
                });
            }
        }
        catch (err) {
            console.error("Error getting file cache stats:", err);
        }
        return {
            totalDexes,
            totalFiles,
            totalSizeBytes,
            cacheDirPath: this.localCacheDir
        };
    }
    /**
     * Get all cached namespaces for a specific dex
     */
    getDexNamespaces(dexId) {
        try {
            const dexDir = path_1.default.join(this.localCacheDir, dexId);
            if (!fs_1.default.existsSync(dexDir)) {
                return [];
            }
            const files = fs_1.default.readdirSync(dexDir);
            return files
                .filter(file => file.endsWith('.json'))
                .map(file => file.replace('.json', ''));
        }
        catch (err) {
            console.error(`Error getting namespaces for dex ${dexId}:`, err);
            return [];
        }
    }
    /**
     * Get all cached dex IDs
     */
    getAllDexIds() {
        try {
            if (!fs_1.default.existsSync(this.localCacheDir)) {
                return [];
            }
            return fs_1.default.readdirSync(this.localCacheDir)
                .filter(item => {
                const itemPath = path_1.default.join(this.localCacheDir, item);
                return fs_1.default.statSync(itemPath).isDirectory();
            });
        }
        catch (err) {
            console.error("Error getting all dex IDs:", err);
            return [];
        }
    }
    /**
     * Change the local cache directory
     */
    setLocalCacheDir(newDir) {
        this.localCacheDir = newDir;
    }
    /**
     * Get the current local cache directory
     */
    getLocalCacheDir() {
        return this.localCacheDir;
    }
}
exports.FileCacheManager = FileCacheManager;
// Export a default instance for backward compatibility
exports.defaultFileCache = new FileCacheManager();
// Export individual functions for backward compatibility
const getDexNamespaceLocalCache = (dexId, nameSpace) => exports.defaultFileCache.getDexNamespaceLocalCache(dexId, nameSpace);
exports.getDexNamespaceLocalCache = getDexNamespaceLocalCache;
const setDexNameSpaceLocalCache = (dexId, namespace, serializedData) => exports.defaultFileCache.setDexNameSpaceLocalCache(dexId, namespace, serializedData);
exports.setDexNameSpaceLocalCache = setDexNameSpaceLocalCache;
