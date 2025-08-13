import { CacheNamespaceType } from "./memory.cache";
export declare class FileCacheManager<DexIdTypes> {
    private localCacheDir;
    constructor(localCacheDir?: string);
    /**
     * Ensure the directory exists before performing any operations
     */
    private ensureDirExists;
    /**
     * Get the file path for a specific dex and namespace
     */
    private getFilePath;
    /**
     * Get data from local file cache
     */
    getDexNamespaceLocalCache<T>(dexId: DexIdTypes, nameSpace: CacheNamespaceType): T | null;
    /**
     * Set data in local file cache
     */
    setDexNameSpaceLocalCache(dexId: DexIdTypes, namespace: CacheNamespaceType, serializedData: string): void;
    /**
     * Delete data from local file cache
     */
    deleteDexNamespaceLocalCache(dexId: DexIdTypes, namespace: CacheNamespaceType): void;
    /**
     * Check if data exists in local file cache
     */
    existsDexNamespaceLocalCache(dexId: DexIdTypes, namespace: CacheNamespaceType): boolean;
    /**
     * Clear all cache files for a specific dex
     */
    clearDexCache(dexId: DexIdTypes): void;
    /**
     * Clear all cache files
     */
    clearAllCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        totalDexes: number;
        totalFiles: number;
        totalSizeBytes: number;
        cacheDirPath: string;
    };
    /**
     * Get all cached namespaces for a specific dex
     */
    getDexNamespaces(dexId: DexIdTypes): CacheNamespaceType[];
    /**
     * Get all cached dex IDs
     */
    getAllDexIds(): DexIdTypes[];
    /**
     * Change the local cache directory
     */
    setLocalCacheDir(newDir: string): void;
    /**
     * Get the current local cache directory
     */
    getLocalCacheDir(): string;
}
export declare const defaultFileCache: FileCacheManager<unknown>;
export declare const getDexNamespaceLocalCache: <T, DexIdTypes>(dexId: DexIdTypes, nameSpace: CacheNamespaceType) => T;
export declare const setDexNameSpaceLocalCache: <DexIdTypes>(dexId: DexIdTypes, namespace: CacheNamespaceType, serializedData: string) => void;
