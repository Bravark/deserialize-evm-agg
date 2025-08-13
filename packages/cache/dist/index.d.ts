import { Graph, TokenBiMap } from "@deserialize-evm-agg/graph";
import { FileCacheManager } from "./file.cache";
import { MemoryCacheManager, CacheNamespaceType } from "./memory.cache";
import { RedisClientType } from "redis";
type StorageDestination = "REDIS" | "FILE";
type TokenDetailsLocalCacheMap<TokenDetailsGenerics> = Map<string, TokenDetailsGenerics>;
interface DexCacheOptions<DexIdTypes> {
    storageDestination?: StorageDestination;
    redisClient?: RedisClientType;
    memoryCache?: MemoryCacheManager<DexIdTypes>;
    fileCache?: FileCacheManager<DexIdTypes>;
}
export declare class DexCache<DexIdTypes> {
    private storageDestination;
    private redisCache?;
    private memoryCache;
    private fileCache;
    constructor(options?: DexCacheOptions<DexIdTypes>);
    /**
     * Set Redis client after initialization
     */
    setRedisClient(redisClient: RedisClientType): void;
    /**
     * Get data from storage (file or redis)
     */
    private getStoreData;
    /**
     * Set data to storage (file or redis)
     */
    private setStoreData;
    /**
     * Get cached data for a specific DEX and namespace
     */
    getDexNamespaceCache<T>(namespace: CacheNamespaceType, dexId: DexIdTypes): Promise<T | null>;
    /**
     * Set cached data for a specific DEX and namespace
     */
    setDexNamespaceCache(namespace: CacheNamespaceType, dexId: DexIdTypes, data: unknown): Promise<void>;
    /**
     * Get token index BiMap cache
     */
    getDexTokenIndexBiMapCache<T>(dexId: DexIdTypes, functionToParseTheObjectInTheData: (d: any) => T): Promise<TokenBiMap<T> | null>;
    /**
     * Set token index BiMap cache
     */
    setDexTokenIndexBiMapCache<T>(dexId: DexIdTypes, data: TokenBiMap<T>): Promise<void>;
    /**
     * Set DEX graph cache
     */
    setDexGraphCache<T>(dexId: DexIdTypes, data: Graph): Promise<void>;
    /**
     * Get DEX graph cache
     */
    getDexGraphCache(dexId: DexIdTypes): Promise<Graph | null>;
    /**
     * Set token details
     */
    setTokenDetails<TokenDetailsGenerics>(dexId: DexIdTypes, data: TokenDetailsLocalCacheMap<TokenDetailsGenerics>): Promise<void>;
    /**
     * Set mint to cache
     */
    setMintToCache<TokenDetailsGenerics extends {
        contractAddress: string;
    }>(dexId: DexIdTypes, tokenDetails: TokenDetailsGenerics): Promise<void>;
    /**
     * Get mint from cache
     */
    getMintFromCache<TokenDetailsGenerics>(dexId: DexIdTypes, mintAddress: string): Promise<TokenDetailsGenerics | null>;
    /**
     * Get token details
     */
    getTokenDetails<TokenDetailsGenerics>(dexId: DexIdTypes): Promise<TokenDetailsLocalCacheMap<TokenDetailsGenerics> | null>;
    /**
     * Set token price (only works with Redis)
     */
    setPriceToCache(token: string, price: number, expiryInSeconds?: number): Promise<void>;
    /**
     * Get token price (only works with Redis)
     */
    getPriceFromCache(token: string): Promise<number | null>;
    /**
     * Set multiple prices at once (only works with Redis)
     */
    setBatchPrices(prices: Record<string, number>, expiryInSeconds?: number): Promise<void>;
    /**
     * Get multiple prices at once (only works with Redis)
     */
    getBatchPrices(tokens: string[]): Promise<Record<string, number | null>>;
    /**
     * Format TVL data
     */
    static formatTvlData(tlvData: any): Buffer;
    /**
     * Change storage destination
     */
    setStorageDestination(destination: StorageDestination): void;
    /**
     * Get current storage destination
     */
    getStorageDestination(): StorageDestination;
    /**
     * Clear all cache for a specific dex
     */
    clearDexCache(dexId: DexIdTypes): Promise<void>;
    /**
     * Clear specific namespace cache for a dex
     */
    clearNamespaceCache(namespace: CacheNamespaceType, dexId: DexIdTypes): Promise<void>;
    /**
     * Clear all cache
     */
    clearAllCache(): Promise<void>;
    /**
     * Get cache statistics
     */
    getCacheStats(): Promise<{
        memory: {
            totalDexes: number;
            totalNamespaces: number;
        };
        redis?: {
            totalKeys: number;
            dexCacheKeys: number;
            priceKeys: number;
            memoryUsage: string;
        };
    }>;
    /**
     * Health check for cache systems
     */
    healthCheck(): Promise<{
        memory: boolean;
        redis?: boolean;
    }>;
    /**
     * Get memory cache manager instance
     */
    getMemoryCache<DexIdTypes>(): MemoryCacheManager<DexIdTypes>;
}
export declare const defaultDexCache: DexCache<unknown>;
export {};
