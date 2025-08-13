import path from "path";
import fs from "fs";
import { CacheNamespaceType } from "./memory.cache";

export class FileCacheManager<DexIdTypes> {
  private localCacheDir: string;

  constructor(localCacheDir: string = "./GraphData") {
    this.localCacheDir = localCacheDir;
  }

  /**
   * Ensure the directory exists before performing any operations
   */
  private ensureDirExists(dexId: DexIdTypes): string {
    const DIR = path.join(this.localCacheDir, dexId as string);
    if (!fs.existsSync(DIR)) {
      fs.mkdirSync(DIR, { recursive: true }); // Create the directory
    }
    return DIR;
  }

  /**
   * Get the file path for a specific dex and namespace
   */
  private getFilePath(dexId: DexIdTypes, namespace: CacheNamespaceType): string {
    const dexDir = this.ensureDirExists(dexId);
    return path.join(dexDir, `${namespace}.json`);
  }

  /**
   * Get data from local file cache
   */
  getDexNamespaceLocalCache<T>(
    dexId: DexIdTypes,
    nameSpace: CacheNamespaceType
  ): T | null {
    const filePath = this.getFilePath(dexId, nameSpace);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return data as T;
    } catch (err) {
      console.error(`Error reading file cache for ${dexId}:${nameSpace}:`, err);
      return null;
    }
  }

  /**
   * Set data in local file cache
   */
  setDexNameSpaceLocalCache(
    dexId: DexIdTypes,
    namespace: CacheNamespaceType,
    serializedData: string
  ): void {
    try {
      const filePath = this.getFilePath(dexId, namespace);
      fs.writeFileSync(filePath, serializedData, "utf8");
    } catch (err) {
      console.error(`Error writing file cache for ${dexId}:${namespace}:`, err);
    }
  }

  /**
   * Delete data from local file cache
   */
  deleteDexNamespaceLocalCache(
    dexId: DexIdTypes,
    namespace: CacheNamespaceType
  ): void {
    try {
      const filePath = this.getFilePath(dexId, namespace);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`Error deleting file cache for ${dexId}:${namespace}:`, err);
    }
  }

  /**
   * Check if data exists in local file cache
   */
  existsDexNamespaceLocalCache(
    dexId: DexIdTypes,
    namespace: CacheNamespaceType
  ): boolean {
    const filePath = this.getFilePath(dexId, namespace);
    return fs.existsSync(filePath);
  }

  /**
   * Clear all cache files for a specific dex
   */
  clearDexCache(dexId: DexIdTypes): void {
    try {
      const dexDir = path.join(this.localCacheDir, dexId as string);
      if (fs.existsSync(dexDir)) {
        const files = fs.readdirSync(dexDir);
        files.forEach(file => {
          const filePath = path.join(dexDir, file);
          fs.unlinkSync(filePath);
        });
        fs.rmdirSync(dexDir);
      }
    } catch (err) {
      console.error(`Error clearing dex cache for ${dexId}:`, err);
    }
  }

  /**
   * Clear all cache files
   */
  clearAllCache(): void {
    try {
      if (fs.existsSync(this.localCacheDir)) {
        const dexDirs = fs.readdirSync(this.localCacheDir);
        dexDirs.forEach(dexDir => {
          const dexPath = path.join(this.localCacheDir, dexDir);
          if (fs.statSync(dexPath).isDirectory()) {
            this.clearDexCache(dexDir as DexIdTypes);
          }
        });
      }
    } catch (err) {
      console.error("Error clearing all file cache:", err);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalDexes: number;
    totalFiles: number;
    totalSizeBytes: number;
    cacheDirPath: string;
  } {
    let totalFiles = 0;
    let totalSizeBytes = 0;
    let totalDexes = 0;

    try {
      if (fs.existsSync(this.localCacheDir)) {
        const dexDirs = fs.readdirSync(this.localCacheDir);

        dexDirs.forEach(dexDir => {
          const dexPath = path.join(this.localCacheDir, dexDir);
          if (fs.statSync(dexPath).isDirectory()) {
            totalDexes++;
            const files = fs.readdirSync(dexPath);
            files.forEach(file => {
              const filePath = path.join(dexPath, file);
              if (file.endsWith('.json')) {
                totalFiles++;
                const stats = fs.statSync(filePath);
                totalSizeBytes += stats.size;
              }
            });
          }
        });
      }
    } catch (err) {
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
  getDexNamespaces(dexId: DexIdTypes): CacheNamespaceType[] {
    try {
      const dexDir = path.join(this.localCacheDir, dexId as string);
      if (!fs.existsSync(dexDir)) {
        return [];
      }

      const files = fs.readdirSync(dexDir);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', '') as CacheNamespaceType);
    } catch (err) {
      console.error(`Error getting namespaces for dex ${dexId}:`, err);
      return [];
    }
  }

  /**
   * Get all cached dex IDs
   */
  getAllDexIds(): DexIdTypes[] {
    try {
      if (!fs.existsSync(this.localCacheDir)) {
        return [];
      }

      return fs.readdirSync(this.localCacheDir)
        .filter(item => {
          const itemPath = path.join(this.localCacheDir, item);
          return fs.statSync(itemPath).isDirectory();
        }) as DexIdTypes[];
    } catch (err) {
      console.error("Error getting all dex IDs:", err);
      return [];
    }
  }

  /**
   * Change the local cache directory
   */
  setLocalCacheDir(newDir: string): void {
    this.localCacheDir = newDir;
  }

  /**
   * Get the current local cache directory
   */
  getLocalCacheDir(): string {
    return this.localCacheDir;
  }
}

// Export a default instance for backward compatibility
export const defaultFileCache = new FileCacheManager();

// Export individual functions for backward compatibility
export const getDexNamespaceLocalCache = <T, DexIdTypes>(dexId: DexIdTypes, nameSpace: CacheNamespaceType) =>
  defaultFileCache.getDexNamespaceLocalCache<T>(dexId, nameSpace);

export const setDexNameSpaceLocalCache = <DexIdTypes>(dexId: DexIdTypes, namespace: CacheNamespaceType, serializedData: string) =>
  defaultFileCache.setDexNameSpaceLocalCache(dexId, namespace, serializedData);