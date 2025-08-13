"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryCache = exports.defaultMemoryCache = exports.MemoryCacheManager = void 0;
const constants_1 = require("./constants");
class MemoryCacheManager {
    constructor() {
        this.cache = new Map();
    }
    /**
     * Get the cache for a specific dex
     */
    getDexMemoryCache(dexId) {
        if (!this.cache.has(dexId)) {
            this.cache.set(dexId, null);
        }
        return this.cache.get(dexId);
    }
    /**
     * Get the cache for a specific namespace
     */
    getNamespaceMemoryCache(namespace, dexId) {
        let dexMemoryCache = new Map();
        const _dexMemoryCache = this.getDexMemoryCache(dexId);
        if (_dexMemoryCache) {
            dexMemoryCache = _dexMemoryCache;
        }
        else {
            dexMemoryCache.set(namespace, null);
            this.cache.set(dexId, dexMemoryCache);
        }
        return dexMemoryCache.get(namespace);
    }
    /**
     * Set the cache for a specific namespace
     */
    setNamespaceMemoryCache(namespace, dexId, value) {
        let dexMemoryCache = new Map();
        const _dexMemoryCache = this.getDexMemoryCache(dexId);
        if (_dexMemoryCache) {
            dexMemoryCache = _dexMemoryCache;
        }
        dexMemoryCache.set(namespace, value);
        this.cache.set(dexId, dexMemoryCache);
    }
    /**
     * Get the cache for a specific token index bi map
     */
    getTokenIndexBiMapMemoryCache(dexId) {
        return this.getNamespaceMemoryCache(constants_1.DEX_CACHE_NAMESPACE.TOKEN_INDEX_BI_MAP, dexId);
    }
    /**
     * Set the cache for a specific token index bi map
     */
    setTokenIndexBiMapMemoryCache(dexId, tokenBiMap) {
        this.setNamespaceMemoryCache(constants_1.DEX_CACHE_NAMESPACE.TOKEN_INDEX_BI_MAP, dexId, tokenBiMap);
    }
    /**
     * Get the cache for a specific token pool map
     */
    getTokenPoolMapMemoryCache(dexId) {
        return this.getNamespaceMemoryCache(constants_1.DEX_CACHE_NAMESPACE.TOKEN_POOL_MAP, dexId);
    }
    /**
     * Set the cache for a specific token pool map
     */
    setTokenPoolMapMemoryCache(dexId, tokenPoolMapMemoryCache) {
        this.setNamespaceMemoryCache(constants_1.DEX_CACHE_NAMESPACE.TOKEN_POOL_MAP, dexId, tokenPoolMapMemoryCache);
    }
    /**
     * Get the cache for a specific token mint map
     */
    getTokenMintMapMemoryCache(dexId) {
        return this.getNamespaceMemoryCache(constants_1.DEX_CACHE_NAMESPACE.TOKEN_MINT_MAP, dexId);
    }
    /**
     * Set the cache for a specific token mint map
     */
    setTokenMintMapMemoryCache(dexId, tokenMintMapMemoryCache) {
        this.setNamespaceMemoryCache(constants_1.DEX_CACHE_NAMESPACE.TOKEN_MINT_MAP, dexId, tokenMintMapMemoryCache);
    }
    /**
     * Get the cache for a dex graph
     */
    getGraphMemoryCache(dexId) {
        return this.getNamespaceMemoryCache(constants_1.DEX_CACHE_NAMESPACE.GRAPH, dexId);
    }
    /**
     * Set the cache for a dex graph
     */
    setGraphMemoryCache(dexId, graph) {
        this.setNamespaceMemoryCache(constants_1.DEX_CACHE_NAMESPACE.GRAPH, dexId, graph);
    }
    /**
     * Clear all cache for a specific dex
     */
    clearDexCache(dexId) {
        this.cache.delete(dexId);
    }
    /**
     * Clear specific namespace cache for a dex
     */
    clearNamespaceCache(namespace, dexId) {
        const dexCache = this.getDexMemoryCache(dexId);
        if (dexCache) {
            dexCache.delete(namespace);
        }
    }
    /**
     * Clear all cache
     */
    clearAllCache() {
        this.cache.clear();
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        let totalNamespaces = 0;
        this.cache.forEach((dexCache) => {
            if (dexCache) {
                totalNamespaces += dexCache.size;
            }
        });
        return {
            totalDexes: this.cache.size,
            totalNamespaces
        };
    }
}
exports.MemoryCacheManager = MemoryCacheManager;
// Export a default instance for backward compatibility
exports.defaultMemoryCache = new MemoryCacheManager();
// Export the global cache for backward compatibility
exports.MemoryCache = new Map();
// // Export functions for backward compatibility
// export const getDexMemoryCache = (dexId: DexIdTypes) =>
//   defaultMemoryCache['getDexMemoryCache'](dexId);
// export const getNamespaceMemoryCache = (namespace: CacheNamespaceType, dexId: DexIdTypes) =>
//   defaultMemoryCache.getNamespaceMemoryCache(namespace, dexId);
// export const setNamespaceMemoryCache = (namespace: CacheNamespaceType, dexId: DexIdTypes, value: unknown) =>
//   defaultMemoryCache.setNamespaceMemoryCache(namespace, dexId, value);
// export const getTokenIndexBiMapMemoryCache = (dexId: DexIdTypes) =>
//   defaultMemoryCache.getTokenIndexBiMapMemoryCache(dexId);
// export const setTokenIndexBiMapMemoryCache = (dexId: DexIdTypes, tokenBiMap: ArrayBiMap<string>) =>
//   defaultMemoryCache.setTokenIndexBiMapMemoryCache(dexId, tokenBiMap);
// export const getTokenPoolMapMemoryCache = (dexId: DexIdTypes) =>
//   defaultMemoryCache.getTokenPoolMapMemoryCache(dexId);
// export const setTokenPoolMapMemoryCache = (dexId: DexIdTypes, tokenPoolMapMemoryCache: Map<string, string>) =>
//   defaultMemoryCache.setTokenPoolMapMemoryCache(dexId, tokenPoolMapMemoryCache);
// export const getTokenMintMapMemoryCache = (dexId: DexIdTypes) =>
//   defaultMemoryCache.getTokenMintMapMemoryCache(dexId);
// export const setTokenMintMapMemoryCache = (dexId: DexIdTypes, tokenMintMapMemoryCache: Map<string, string>) =>
//   defaultMemoryCache.setTokenMintMapMemoryCache(dexId, tokenMintMapMemoryCache);
// export const getGraphMemoryCache = (dexId: DexIdTypes) =>
//   defaultMemoryCache.getGraphMemoryCache(dexId);
// export const setGraphMemoryCache = (dexId: DexIdTypes, graph: Graph) =>
//   defaultMemoryCache.setGraphMemoryCache(dexId, graph);
