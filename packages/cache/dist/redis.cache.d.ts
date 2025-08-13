import { RedisClientType } from "redis";
import { CacheNamespaceType } from "./memory.cache";
export declare class RedisCacheManager<DexIdTypes> {
    private redisClient;
    constructor(redisClient: RedisClientType);
    /**
     * Get the Redis key for a specific dex and namespace
     */
    private getRedisKey;
    /**
     * Get the Redis key for token prices
     */
    private getPriceKey;
    /**
     * Get data from Redis cache
     */
    getDexNamespaceRedisCache<T>(dexId: DexIdTypes, namespace: CacheNamespaceType): Promise<T | null>;
    /**
     * Set data in Redis cache
     */
    setDexNamespaceRedisCache(dexId: DexIdTypes, namespace: CacheNamespaceType, serializedData: string, expiryInSeconds?: number): Promise<void>;
    /**
     * Delete data from Redis cache
     */
    deleteDexNamespaceRedisCache(dexId: DexIdTypes, namespace: CacheNamespaceType): Promise<void>;
    /**
     * Check if data exists in Redis cache
     */
    existsDexNamespaceRedisCache(dexId: DexIdTypes, namespace: CacheNamespaceType): Promise<boolean>;
    /**
     * Set token price in Redis with expiration
     */
    setPriceToRedis(token: string, price: number, expiryInSeconds?: number): Promise<void>;
    /**
     * Get token price from Redis
     */
    getPriceFromRedis(token: string): Promise<number | null>;
    /**
     * Set multiple prices at once
     */
    setBatchPrices(prices: Record<string, number>, expiryInSeconds?: number): Promise<void>;
    /**
     * Get multiple prices at once
     */
    getBatchPrices(tokens: string[]): Promise<Record<string, number | null>>;
    /**
     * Clear all cache for a specific dex
     */
    clearDexCache(dexId: DexIdTypes): Promise<void>;
    /**
     * Clear all token prices
     */
    clearAllPrices(): Promise<void>;
    /**
     * Get cache statistics
     */
    getCacheStats(): Promise<{
        totalKeys: number;
        dexCacheKeys: number;
        priceKeys: number;
    }>;
    /**
     * Health check for Redis connection
     */
    healthCheck(): Promise<boolean>;
    /**
     * Get the underlying Redis client (if needed for advanced operations)
     */
    getClient(): RedisClientType;
}
