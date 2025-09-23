


import { ArrayBiMap, Graph, isEmptyObject, TokenBiMap } from "@deserialize-evm-agg/graph";
import { DEX_CACHE_NAMESPACE } from "./constants";

import { FileCacheManager } from "./file.cache";
import { MemoryCacheManager, CacheNamespaceType } from "./memory.cache";
import { RedisCacheManager } from "./redis.cache";
import { RedisClientType } from "redis";

type StorageDestination = "REDIS" | "FILE";

interface TokenIndexBiMapLocalCache<T> {
  tokenBiMap: string[];
  data: T[];
  tokenPoolMap: [string, string][];
}

type TokenDetailsLocalCacheMap<TokenDetailsGenerics> = Map<string, TokenDetailsGenerics>;

interface DexCacheOptions<DexIdTypes> {
  storageDestination?: StorageDestination;
  redisClient?: RedisClientType;
  memoryCache?: MemoryCacheManager<DexIdTypes>;
  fileCache?: FileCacheManager<DexIdTypes>;
}

export class DexCache<DexIdTypes> {
  private storageDestination: StorageDestination;
  private redisCache?: RedisCacheManager<DexIdTypes>;
  private memoryCache: MemoryCacheManager<DexIdTypes>;
  private fileCache: FileCacheManager<DexIdTypes>;

  constructor(options: DexCacheOptions<DexIdTypes> = {}) {
    this.storageDestination = options.storageDestination || "FILE";
    this.memoryCache = options.memoryCache || new MemoryCacheManager();
    this.fileCache = options.fileCache || new FileCacheManager();

    if (options.redisClient) {
      this.redisCache = new RedisCacheManager(options.redisClient);
    }
  }

  /**
   * Set Redis client after initialization
   */
  setRedisClient(redisClient: RedisClientType): void {
    this.redisCache = new RedisCacheManager(redisClient);
    this.storageDestination = "REDIS";
  }

  /**
   * Get data from storage (file or redis)
   */
  private async getStoreData<T>(dexId: DexIdTypes, namespace: CacheNamespaceType): Promise<T | null> {
    if (this.storageDestination === "FILE") {
      // If using file storage, fetch from local cache
      const fileData = this.fileCache.getDexNamespaceLocalCache<T>(dexId, namespace);
      if (fileData) {
        // Set it in memory cache
        this.memoryCache.setNamespaceMemoryCache(namespace, dexId, fileData);
        return typeof fileData === "string" ? JSON.parse(fileData) : fileData;
      }
    } else if (this.storageDestination === "REDIS" && this.redisCache) {
      // If using Redis, fetch from Redis cache
      const redisData = await this.redisCache.getDexNamespaceRedisCache<T>(dexId, namespace);
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
  private async setStoreData(
    dexId: DexIdTypes,
    namespace: CacheNamespaceType,
    data: unknown
  ): Promise<void> {
    // Save to memory cache
    // console.log('data to store in memory setStoreData: ', data[0]);
    this.memoryCache.setNamespaceMemoryCache(namespace, dexId, data);

    if (this.storageDestination === "FILE") {
      // Save to file cache
      this.fileCache.setDexNameSpaceLocalCache(dexId, namespace, JSON.stringify(data));
    } else if (this.storageDestination === "REDIS" && this.redisCache) {
      // Save to Redis
      await this.redisCache.setDexNamespaceRedisCache(dexId, namespace, JSON.stringify(data));
    }
  }

  /**
   * Get cached data for a specific DEX and namespace
   */
  async getDexNamespaceCache<T>(

    namespace: CacheNamespaceType,
    dexId: DexIdTypes
  ): Promise<T | null> {
    // First check memory cache
    // const data = this.memoryCache.getNamespaceMemoryCache(namespace, dexId);
    // if (data) {
    //   const res = typeof data === "string" ? JSON.parse(data) : data
    //   return res as T;
    // }
    return (await this.getStoreData<T>(dexId, namespace)) || null;
  }

  /**
   * Set cached data for a specific DEX and namespace
   */
  async setDexNamespaceCache(
    namespace: CacheNamespaceType,
    dexId: DexIdTypes,
    data: unknown
  ): Promise<void> {
    // Save to memory cache
    // console.log('data to store in memory setDexNamespaceCache : ', data);
    this.memoryCache.setNamespaceMemoryCache(namespace, dexId, data);
    // Save to persistent storage
    await this.setStoreData(dexId, namespace, data);
  }

  /**
   * Get token index BiMap cache
   */
  async getDexTokenIndexBiMapCache<T>(
    dexId: DexIdTypes,
    functionToParseTheObjectInTheData: (d: any) => T
  ): Promise<TokenBiMap<T> | null> {
    const namespace = DEX_CACHE_NAMESPACE.TOKEN_INDEX_BI_MAP;

    // Check memory cache first
    const data = this.memoryCache.getNamespaceMemoryCache(namespace, dexId);
    // console.log('data from memory: ', data);
    if (data) {
      const res = typeof data === "string" ? JSON.parse(data) : data
      const formattedObject = {
        tokenBiMap: new ArrayBiMap<string>(res.tokenBiMap),
        tokenPoolMap: new Map<string, string>(res.tokenPoolMap),
        data: res.data.map(functionToParseTheObjectInTheData),
      };
      return formattedObject;
    }

    // Not in memory, fetch from persistent storage
    let persistenceStorage = await this.getStoreData<TokenIndexBiMapLocalCache<T>>(dexId, namespace);
    persistenceStorage = typeof persistenceStorage === "string" ? JSON.parse(persistenceStorage) : persistenceStorage
    if (persistenceStorage && !isEmptyObject(persistenceStorage)) {
      // Convert raw data to objects
      const formattedObject = {
        tokenBiMap: new ArrayBiMap<string>(persistenceStorage.tokenBiMap),
        tokenPoolMap: new Map<string, string>(persistenceStorage.tokenPoolMap),
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
  async setDexTokenIndexBiMapCache<T>(
    dexId: DexIdTypes,
    data: TokenBiMap<T>
  ): Promise<void> {
    const namespace = DEX_CACHE_NAMESPACE.TOKEN_INDEX_BI_MAP;

    // Save to memory cache
    // console.log('data to store in setDexTokenIndexBiMapCache: ', data.tokenBiMap);
    this.memoryCache.setNamespaceMemoryCache(namespace, dexId, data);


    // Convert to a format suitable for storage
    console.log('data.tokenBiMap.toArray(): ', data.tokenBiMap.toArray());
    console.log('data.tokenBiMap.toArray(): ', data.tokenBiMap);
    const storageData: TokenIndexBiMapLocalCache<T> = {
      tokenBiMap: Array.isArray(data.tokenBiMap) ? data.tokenBiMap : data.tokenBiMap.toArray(),
      data: data.data,
      tokenPoolMap: Array.from([...data.tokenPoolMap.entries()]),
    };

    // Save to storage
    await this.setStoreData(dexId, namespace, JSON.stringify(storageData));
  }

  /**
   * Set DEX graph cache
   */
  async setDexGraphCache<T>(dexId: DexIdTypes, data: Graph): Promise<void> {
    const namespace = DEX_CACHE_NAMESPACE.GRAPH;

    // Save to memory cache
    this.memoryCache.setNamespaceMemoryCache(namespace, dexId, data);

    // Save to storage
    await this.setStoreData(dexId, namespace, JSON.stringify(data));
  }

  /**
   * Get DEX graph cache
   */
  async getDexGraphCache(dexId: DexIdTypes): Promise<Graph | null> {
    // Check memory cache
    // const data = this.memoryCache.getNamespaceMemoryCache(DEX_CACHE_NAMESPACE.GRAPH, dexId) as Graph;

    // if (data) {
    //   const formatted = typeof data === "string" ? JSON.parse(data) : data
    //   return formatted;
    // }

    // Not in memory, fetch from storage
    const storageData = await this.getStoreData<Graph>(dexId, DEX_CACHE_NAMESPACE.GRAPH);

    if (storageData) {
      // Set in memory cache
      this.memoryCache.setNamespaceMemoryCache(DEX_CACHE_NAMESPACE.GRAPH, dexId, storageData);
      const formattedStorageData = typeof storageData === "string" ? JSON.parse(storageData) : storageData
      return formattedStorageData;

    }

    return null;
  }

  /**
   * Set token details
   */
  async setTokenDetails<TokenDetailsGenerics>(
    dexId: DexIdTypes,
    data: TokenDetailsLocalCacheMap<TokenDetailsGenerics>
  ): Promise<void> {
    const namespace = DEX_CACHE_NAMESPACE.TOKEN_MINT_MAP;

    // Save to memory cache
    this.memoryCache.setNamespaceMemoryCache(namespace, dexId, data);

    // Save to storage
    await this.setStoreData(dexId, namespace, JSON.stringify([...data.entries()]));
  }

  /**
   * Set mint to cache
   */
  async setMintToCache<TokenDetailsGenerics extends { contractAddress: string }>(dexId: DexIdTypes, tokenDetails: TokenDetailsGenerics): Promise<void> {
    const oldCache = await this.getTokenDetails(dexId);
    const TokenDetailsMap = new Map(oldCache?.entries() || []);
    TokenDetailsMap.set(tokenDetails.contractAddress, tokenDetails);
    await this.setTokenDetails(dexId, TokenDetailsMap);
  }

  /**
   * Get mint from cache
   */
  async getMintFromCache<TokenDetailsGenerics>(
    dexId: DexIdTypes,
    mintAddress: string
  ): Promise<TokenDetailsGenerics | null> {
    // Check memory cache
    const data = this.memoryCache.getNamespaceMemoryCache(
      DEX_CACHE_NAMESPACE.TOKEN_MINT_MAP,
      dexId
    ) as TokenDetailsLocalCacheMap<TokenDetailsGenerics> | null;

    if (data && data.has(mintAddress)) {
      const res = data.get(mintAddress) || null;

      return typeof res == "string" ? JSON.parse(res) : res
    }

    // Not in memory, fetch from storage
    const storageData = await this.getStoreData<[string, TokenDetailsGenerics][]>(
      dexId,
      DEX_CACHE_NAMESPACE.TOKEN_MINT_MAP
    );

    if (storageData && storageData.length > 0) {
      const oldMap = new Map<string, TokenDetailsGenerics>(storageData);
      const formatted = new Map(
        [...oldMap.entries()].map((x) => {
          return [x[0], x[1]];
        })
      );

      // Set in memory cache
      this.memoryCache.setNamespaceMemoryCache(
        DEX_CACHE_NAMESPACE.TOKEN_MINT_MAP,
        dexId,
        formatted
      );

      return formatted.get(mintAddress) || null;
    }

    return null;
  }

  /**
   * Get token details
   */
  async getTokenDetails<TokenDetailsGenerics>(dexId: DexIdTypes): Promise<TokenDetailsLocalCacheMap<TokenDetailsGenerics> | null> {
    // Check memory cache
    const data = this.memoryCache.getNamespaceMemoryCache(
      DEX_CACHE_NAMESPACE.TOKEN_MINT_MAP,
      dexId
    ) as TokenDetailsLocalCacheMap<TokenDetailsGenerics> | null;

    if (data && data.size > 1) {
      return data;
    }

    // Not in memory, fetch from storage
    const storageData = await this.getStoreData<[string, TokenDetailsGenerics][]>(
      dexId,
      DEX_CACHE_NAMESPACE.TOKEN_MINT_MAP
    );

    if (storageData && storageData.length > 0) {
      const oldMap = new Map<string, TokenDetailsGenerics>(storageData);
      const formatted = new Map(
        [...oldMap.entries()].map((x) => {
          return [x[0], x[1]];
        })
      );

      // Set in memory cache
      this.memoryCache.setNamespaceMemoryCache(
        DEX_CACHE_NAMESPACE.TOKEN_MINT_MAP,
        dexId,
        formatted
      );

      return formatted;
    }

    return null;
  }

  // Price-related methods (delegates to Redis cache)
  /**
   * Set token price (only works with Redis)
   */
  async setPriceToCache(token: string, price: number, expiryInSeconds: number = 3600): Promise<void> {
    if (!this.redisCache) {
      throw new Error("Redis cache not configured. Cannot set price.");
    }
    await this.redisCache.setPriceToRedis(token, price, expiryInSeconds);
  }

  /**
   * Get token price (only works with Redis)
   */
  async getPriceFromCache(token: string): Promise<number | null> {
    if (!this.redisCache) {
      throw new Error("Redis cache not configured. Cannot get price.");
    }
    return await this.redisCache.getPriceFromRedis(token);
  }

  /**
   * Set multiple prices at once (only works with Redis)
   */
  async setBatchPrices(prices: Record<string, number>, expiryInSeconds: number = 3600): Promise<void> {
    if (!this.redisCache) {
      throw new Error("Redis cache not configured. Cannot set batch prices.");
    }
    await this.redisCache.setBatchPrices(prices, expiryInSeconds);
  }

  /**
   * Get multiple prices at once (only works with Redis)
   */
  async getBatchPrices(tokens: string[]): Promise<Record<string, number | null>> {
    if (!this.redisCache) {
      throw new Error("Redis cache not configured. Cannot get batch prices.");
    }
    return await this.redisCache.getBatchPrices(tokens);
  }

  /**
   * Format TVL data
   */
  static formatTvlData(tlvData: any): Buffer {
    let data;
    if (tlvData instanceof Buffer) {
      data = tlvData;
    } else if (tlvData.type === "Buffer") {
      data = Buffer.from(tlvData.data);
    } else {
      data = Buffer.from([]);
    }

    return data;
  }

  /**
   * Change storage destination
   */
  setStorageDestination(destination: StorageDestination): void {
    this.storageDestination = destination;
  }

  /**
   * Get current storage destination
   */
  getStorageDestination(): StorageDestination {
    return this.storageDestination;
  }

  /**
   * Clear all cache for a specific dex
   */
  async clearDexCache(dexId: DexIdTypes): Promise<void> {
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
  async clearNamespaceCache(namespace: CacheNamespaceType, dexId: DexIdTypes): Promise<void> {
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
  async clearAllCache(): Promise<void> {
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
  async getCacheStats(): Promise<{
    memory: { totalDexes: number; totalNamespaces: number };
    redis?: { totalKeys: number; dexCacheKeys: number; priceKeys: number; memoryUsage: string };
  }> {
    const memoryStats = this.memoryCache.getCacheStats();
    const stats: any = { memory: memoryStats };

    if (this.redisCache) {
      stats.redis = await this.redisCache.getCacheStats();
    }

    return stats;
  }

  /**
   * Health check for cache systems
   */
  async healthCheck(): Promise<{
    memory: boolean;
    redis?: boolean;
  }> {
    const health: any = { memory: true }; // Memory cache is always available

    if (this.redisCache) {
      health.redis = await this.redisCache.healthCheck();
    }

    return health;
  }

  /**
   * Get memory cache manager instance
   */
  getMemoryCache<DexIdTypes>(): MemoryCacheManager<DexIdTypes> {
    return this.memoryCache as any as MemoryCacheManager<DexIdTypes>;
  }

}

// Export a default instance for backward compatibility
export const defaultDexCache = new DexCache();

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