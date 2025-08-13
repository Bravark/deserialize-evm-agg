"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultDexCache = exports.DexCache = void 0;
const graph_1 = require("@deserialize-evm-agg/graph");
const constants_1 = require("./constants");
const file_cache_1 = require("./file.cache");
const memory_cache_1 = require("./memory.cache");
const redis_cache_1 = require("./redis.cache");
class DexCache {
    constructor(options = {}) {
        this.storageDestination = options.storageDestination || "FILE";
        this.memoryCache = options.memoryCache || new memory_cache_1.MemoryCacheManager();
        this.fileCache = options.fileCache || new file_cache_1.FileCacheManager();
        if (options.redisClient) {
            this.redisCache = new redis_cache_1.RedisCacheManager(options.redisClient);
        }
    }
    /**
     * Set Redis client after initialization
     */
    setRedisClient(redisClient) {
        this.redisCache = new redis_cache_1.RedisCacheManager(redisClient);
        this.storageDestination = "REDIS";
    }
    /**
     * Get data from storage (file or redis)
     */
    async getStoreData(dexId, namespace) {
        if (this.storageDestination === "FILE") {
            // If using file storage, fetch from local cache
            const fileData = this.fileCache.getDexNamespaceLocalCache(dexId, namespace);
            if (fileData) {
                // Set it in memory cache
                this.memoryCache.setNamespaceMemoryCache(namespace, dexId, fileData);
                return typeof fileData === "string" ? JSON.parse(fileData) : fileData;
            }
        }
        else if (this.storageDestination === "REDIS" && this.redisCache) {
            // If using Redis, fetch from Redis cache
            const redisData = await this.redisCache.getDexNamespaceRedisCache(dexId, namespace);
            if (redisData) {
                // Set it in memory cache
                this.memoryCache.setNamespaceMemoryCache(namespace, dexId, redisData);
                return typeof redisData === "string" ? JSON.parse(redisData) : redisData;
            }
        }
        return null;
    }
    /**
     * Set data to storage (file or redis)
     */
    async setStoreData(dexId, namespace, data) {
        // Save to memory cache
        this.memoryCache.setNamespaceMemoryCache(namespace, dexId, data);
        if (this.storageDestination === "FILE") {
            // Save to file cache
            this.fileCache.setDexNameSpaceLocalCache(dexId, namespace, JSON.stringify(data));
        }
        else if (this.storageDestination === "REDIS" && this.redisCache) {
            // Save to Redis
            await this.redisCache.setDexNamespaceRedisCache(dexId, namespace, JSON.stringify(data));
        }
    }
    /**
     * Get cached data for a specific DEX and namespace
     */
    async getDexNamespaceCache(namespace, dexId) {
        // First check memory cache
        const data = this.memoryCache.getNamespaceMemoryCache(namespace, dexId);
        if (data) {
            return data;
        }
        return (await this.getStoreData(dexId, namespace)) || null;
    }
    /**
     * Set cached data for a specific DEX and namespace
     */
    async setDexNamespaceCache(namespace, dexId, data) {
        // Save to memory cache
        this.memoryCache.setNamespaceMemoryCache(namespace, dexId, data);
        // Save to persistent storage
        await this.setStoreData(dexId, namespace, data);
    }
    /**
     * Get token index BiMap cache
     */
    async getDexTokenIndexBiMapCache(dexId, functionToParseTheObjectInTheData) {
        const namespace = constants_1.DEX_CACHE_NAMESPACE.TOKEN_INDEX_BI_MAP;
        // Check memory cache first
        const data = this.memoryCache.getNamespaceMemoryCache(namespace, dexId);
        console.log('data: ', data);
        if (data) {
            return data;
        }
        // Not in memory, fetch from persistent storage
        let persistenceStorage = await this.getStoreData(dexId, namespace);
        persistenceStorage = typeof persistenceStorage === "string" ? JSON.parse(persistenceStorage) : persistenceStorage;
        if (persistenceStorage && !(0, graph_1.isEmptyObject)(persistenceStorage)) {
            // Convert raw data to objects
            const formattedObject = {
                tokenBiMap: new graph_1.ArrayBiMap(persistenceStorage.tokenBiMap),
                tokenPoolMap: new Map(persistenceStorage.tokenPoolMap),
                data: persistenceStorage.data.map(functionToParseTheObjectInTheData),
            };
            // Set in memory cache
            this.memoryCache.setNamespaceMemoryCache(namespace, dexId, formattedObject);
            return formattedObject;
        }
        return null;
    }
    /**
     * Set token index BiMap cache
     */
    async setDexTokenIndexBiMapCache(dexId, data) {
        const namespace = constants_1.DEX_CACHE_NAMESPACE.TOKEN_INDEX_BI_MAP;
        // Save to memory cache
        this.memoryCache.setNamespaceMemoryCache(namespace, dexId, data);
        // Convert to a format suitable for storage
        const storageData = {
            tokenBiMap: data.tokenBiMap.toArray(),
            data: data.data,
            tokenPoolMap: Array.from([...data.tokenPoolMap.entries()]),
        };
        // Save to storage
        await this.setStoreData(dexId, namespace, JSON.stringify(storageData));
    }
    /**
     * Set DEX graph cache
     */
    async setDexGraphCache(dexId, data) {
        const namespace = constants_1.DEX_CACHE_NAMESPACE.GRAPH;
        // Save to memory cache
        this.memoryCache.setNamespaceMemoryCache(namespace, dexId, data);
        // Save to storage
        await this.setStoreData(dexId, namespace, JSON.stringify(data));
    }
    /**
     * Get DEX graph cache
     */
    async getDexGraphCache(dexId) {
        // Check memory cache
        const data = this.memoryCache.getNamespaceMemoryCache(constants_1.DEX_CACHE_NAMESPACE.GRAPH, dexId);
        if (data) {
            const formatted = typeof data === "string" ? JSON.parse(data) : data;
            return formatted;
        }
        // Not in memory, fetch from storage
        const storageData = await this.getStoreData(dexId, constants_1.DEX_CACHE_NAMESPACE.GRAPH);
        if (storageData) {
            // Set in memory cache
            this.memoryCache.setNamespaceMemoryCache(constants_1.DEX_CACHE_NAMESPACE.GRAPH, dexId, storageData);
            const formattedStorageData = typeof storageData === "string" ? JSON.parse(storageData) : storageData;
            return formattedStorageData;
        }
        return null;
    }
    /**
     * Set token details
     */
    async setTokenDetails(dexId, data) {
        const namespace = constants_1.DEX_CACHE_NAMESPACE.TOKEN_MINT_MAP;
        // Save to memory cache
        this.memoryCache.setNamespaceMemoryCache(namespace, dexId, data);
        // Save to storage
        await this.setStoreData(dexId, namespace, JSON.stringify([...data.entries()]));
    }
    /**
     * Set mint to cache
     */
    async setMintToCache(dexId, tokenDetails) {
        const oldCache = await this.getTokenDetails(dexId);
        const TokenDetailsMap = new Map(oldCache?.entries() || []);
        TokenDetailsMap.set(tokenDetails.contractAddress, tokenDetails);
        await this.setTokenDetails(dexId, TokenDetailsMap);
    }
    /**
     * Get mint from cache
     */
    async getMintFromCache(dexId, mintAddress) {
        // Check memory cache
        const data = this.memoryCache.getNamespaceMemoryCache(constants_1.DEX_CACHE_NAMESPACE.TOKEN_MINT_MAP, dexId);
        if (data && data.has(mintAddress)) {
            return data.get(mintAddress) || null;
        }
        // Not in memory, fetch from storage
        const storageData = await this.getStoreData(dexId, constants_1.DEX_CACHE_NAMESPACE.TOKEN_MINT_MAP);
        if (storageData && storageData.length > 0) {
            const oldMap = new Map(storageData);
            const formatted = new Map([...oldMap.entries()].map((x) => {
                return [x[0], x[1]];
            }));
            // Set in memory cache
            this.memoryCache.setNamespaceMemoryCache(constants_1.DEX_CACHE_NAMESPACE.TOKEN_MINT_MAP, dexId, formatted);
            return formatted.get(mintAddress) || null;
        }
        return null;
    }
    /**
     * Get token details
     */
    async getTokenDetails(dexId) {
        // Check memory cache
        const data = this.memoryCache.getNamespaceMemoryCache(constants_1.DEX_CACHE_NAMESPACE.TOKEN_MINT_MAP, dexId);
        if (data && data.size > 1) {
            return data;
        }
        // Not in memory, fetch from storage
        const storageData = await this.getStoreData(dexId, constants_1.DEX_CACHE_NAMESPACE.TOKEN_MINT_MAP);
        if (storageData && storageData.length > 0) {
            const oldMap = new Map(storageData);
            const formatted = new Map([...oldMap.entries()].map((x) => {
                return [x[0], x[1]];
            }));
            // Set in memory cache
            this.memoryCache.setNamespaceMemoryCache(constants_1.DEX_CACHE_NAMESPACE.TOKEN_MINT_MAP, dexId, formatted);
            return formatted;
        }
        return null;
    }
    // Price-related methods (delegates to Redis cache)
    /**
     * Set token price (only works with Redis)
     */
    async setPriceToCache(token, price, expiryInSeconds = 3600) {
        if (!this.redisCache) {
            throw new Error("Redis cache not configured. Cannot set price.");
        }
        await this.redisCache.setPriceToRedis(token, price, expiryInSeconds);
    }
    /**
     * Get token price (only works with Redis)
     */
    async getPriceFromCache(token) {
        if (!this.redisCache) {
            throw new Error("Redis cache not configured. Cannot get price.");
        }
        return await this.redisCache.getPriceFromRedis(token);
    }
    /**
     * Set multiple prices at once (only works with Redis)
     */
    async setBatchPrices(prices, expiryInSeconds = 3600) {
        if (!this.redisCache) {
            throw new Error("Redis cache not configured. Cannot set batch prices.");
        }
        await this.redisCache.setBatchPrices(prices, expiryInSeconds);
    }
    /**
     * Get multiple prices at once (only works with Redis)
     */
    async getBatchPrices(tokens) {
        if (!this.redisCache) {
            throw new Error("Redis cache not configured. Cannot get batch prices.");
        }
        return await this.redisCache.getBatchPrices(tokens);
    }
    /**
     * Format TVL data
     */
    static formatTvlData(tlvData) {
        let data;
        if (tlvData instanceof Buffer) {
            data = tlvData;
        }
        else if (tlvData.type === "Buffer") {
            data = Buffer.from(tlvData.data);
        }
        else {
            data = Buffer.from([]);
        }
        return data;
    }
    /**
     * Change storage destination
     */
    setStorageDestination(destination) {
        this.storageDestination = destination;
    }
    /**
     * Get current storage destination
     */
    getStorageDestination() {
        return this.storageDestination;
    }
    /**
     * Clear all cache for a specific dex
     */
    async clearDexCache(dexId) {
        // Clear memory cache
        this.memoryCache.clearDexCache(dexId);
        // Clear persistent storage
        if (this.storageDestination === "REDIS" && this.redisCache) {
            await this.redisCache.clearDexCache(dexId);
        }
        // Note: File cache clearing would need to be implemented in file.cache module
    }
    /**
     * Clear specific namespace cache for a dex
     */
    async clearNamespaceCache(namespace, dexId) {
        // Clear memory cache
        this.memoryCache.clearNamespaceCache(namespace, dexId);
        // Clear persistent storage
        if (this.storageDestination === "REDIS" && this.redisCache) {
            await this.redisCache.deleteDexNamespaceRedisCache(dexId, namespace);
        }
        // Note: File cache clearing would need to be implemented in file.cache module
    }
    /**
     * Clear all cache
     */
    async clearAllCache() {
        // Clear memory cache
        this.memoryCache.clearAllCache();
        // Clear Redis cache if available
        if (this.redisCache) {
            await this.redisCache.clearAllPrices();
            // Note: This only clears prices, you might want to add a method to clear all dex caches
        }
    }
    /**
     * Get cache statistics
     */
    async getCacheStats() {
        const memoryStats = this.memoryCache.getCacheStats();
        const stats = { memory: memoryStats };
        if (this.redisCache) {
            stats.redis = await this.redisCache.getCacheStats();
        }
        return stats;
    }
    /**
     * Health check for cache systems
     */
    async healthCheck() {
        const health = { memory: true }; // Memory cache is always available
        if (this.redisCache) {
            health.redis = await this.redisCache.healthCheck();
        }
        return health;
    }
    /**
     * Get memory cache manager instance
     */
    getMemoryCache() {
        return this.memoryCache;
    }
}
exports.DexCache = DexCache;
// Export a default instance for backward compatibility
exports.defaultDexCache = new DexCache();
// // Export individual methods for backward compatibility
// export const getStoreData = <T>(dexId: DexIdTypes, namespace: CacheNamespaceType) =>
//   defaultDexCache['getStoreData']<T>(dexId, namespace);
// export const setStoreData = (dexId: DexIdTypes, namespace: CacheNamespaceType, data: unknown) =>
//   defaultDexCache['setStoreData'](dexId, namespace, data);
// export const getDexNamespaceCache = <T>(namespace: CacheNamespaceType, dexId: DexIdTypes) =>
//   defaultDexCache.getDexNamespaceCache<T>(namespace, dexId);
// export const setDexNamespaceCache = (namespace: CacheNamespaceType, dexId: DexIdTypes, data: unknown) =>
//   defaultDexCache.setDexNamespaceCache(namespace, dexId, data);
// export const getDexTokenIndexBiMapCache = <T>(
//   dexId: DexIdTypes,
//   functionToParseTheObjectInTheData: (d: any) => T
// ) => defaultDexCache.getDexTokenIndexBiMapCache<T>(dexId, functionToParseTheObjectInTheData);
// export const setDexTokenIndexBiMapCache = <T>(dexId: DexIdTypes, data: TokenBiMap<T>) =>
//   defaultDexCache.setDexTokenIndexBiMapCache<T>(dexId, data);
// export const setDexGraphCache = <T>(dexId: DexIdTypes, data: Graph) =>
//   defaultDexCache.setDexGraphCache<T>(dexId, data);
// export const getDexGraphCache = (dexId: DexIdTypes) =>
//   defaultDexCache.getDexGraphCache(dexId);
// export const setTokenDetails = (dexId: DexIdTypes, data: TokenDetailsLocalCacheMap) =>
//   defaultDexCache.setTokenDetails(dexId, data);
// export const setMintToCache = (dexId: DexIdTypes, tokenDetails: TokenDetails) =>
//   defaultDexCache.setMintToCache(dexId, tokenDetails);
// export const getMintFromCache = (dexId: DexIdTypes, mintAddress: string) =>
//   defaultDexCache.getMintFromCache(dexId, mintAddress);
// export const getTokenDetails = (dexId: DexIdTypes) =>
//   defaultDexCache.getTokenDetails(dexId);
// export const formatTvlData = DexCache.formatTvlData;
// // Price-related exports
// export const setPriceToCache = (token: string, price: number, expiryInSeconds?: number) =>
//   defaultDexCache.setPriceToCache(token, price, expiryInSeconds);
// export const getPriceFromCache = (token: string) =>
//   defaultDexCache.getPriceFromCache(token);
