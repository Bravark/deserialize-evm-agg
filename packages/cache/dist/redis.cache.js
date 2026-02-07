"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheManager = void 0;
// import { env } from "../../config";
class RedisCacheManager {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
    /**
     * Get the Redis key for a specific dex and namespace
     */
    getRedisKey(dexId, namespace) {
        return `dex:${dexId}:${namespace}`;
    }
    /**
     * Get the Redis key for token prices
     */
    getPriceKey(token) {
        return `TOKEN_PRICE:${token}`;
    }
    /**
     * Get data from Redis cache
     */
    async getDexNamespaceRedisCache(dexId, namespace) {
        try {
            const key = this.getRedisKey(dexId, namespace);
            const data = (await this.redisClient.get(key));
            if (!data)
                return null;
            return JSON.parse(data);
        }
        catch (err) {
            console.error(`Error getting ${namespace} from Redis for dex ${dexId}:`, err);
            return null;
        }
    }
    /**
     * Set data in Redis cache
     */
    async setDexNamespaceRedisCache(dexId, namespace, serializedData, expiryInSeconds) {
        try {
            const key = this.getRedisKey(dexId, namespace);
            if (expiryInSeconds) {
                await this.redisClient.setEx(key, expiryInSeconds, serializedData);
            }
            else {
                await this.redisClient.set(key, serializedData);
            }
        }
        catch (err) {
            console.error(`Error setting ${namespace} in Redis for dex ${dexId}:`, err);
        }
    }
    /**
     * Delete data from Redis cache
     */
    async deleteDexNamespaceRedisCache(dexId, namespace) {
        try {
            const key = this.getRedisKey(dexId, namespace);
            await this.redisClient.del(key);
        }
        catch (err) {
            console.error(`Error deleting ${namespace} from Redis for dex ${dexId}:`, err);
        }
    }
    /**
     * Check if data exists in Redis cache
     */
    async existsDexNamespaceRedisCache(dexId, namespace) {
        try {
            const key = this.getRedisKey(dexId, namespace);
            const exists = await this.redisClient.exists(key);
            return exists === 1;
        }
        catch (err) {
            console.error(`Error checking existence of ${namespace} in Redis for dex ${dexId}:`, err);
            return false;
        }
    }
    /**
     * Set token price in Redis with expiration
     */
    async setPriceToRedis(token, price, expiryInSeconds = 60) {
        try {
            const key = this.getPriceKey(token);
            await this.redisClient.setEx(key, expiryInSeconds, price.toString());
        }
        catch (error) {
            console.error("Error setting price to Redis:", error);
            throw error;
        }
    }
    /**
     * Get token price from Redis
     */
    async getPriceFromRedis(token) {
        try {
            const key = this.getPriceKey(token);
            const price = (await this.redisClient.get(key));
            if (price) {
                return parseFloat(price);
            }
            return null;
        }
        catch (error) {
            console.error("Error getting price from Redis:", error);
            return null;
        }
    }
    /**
     * Set multiple prices at once
     */
    async setBatchPrices(prices, expiryInSeconds = 3600) {
        try {
            const pipeline = this.redisClient.multi();
            Object.entries(prices).forEach(([token, price]) => {
                const key = this.getPriceKey(token);
                pipeline.setEx(key, expiryInSeconds, price.toString());
            });
            await pipeline.exec();
        }
        catch (error) {
            console.error("Error setting batch prices to Redis:", error);
            throw error;
        }
    }
    /**
     * Get multiple prices at once
     */
    async getBatchPrices(tokens) {
        try {
            const keys = tokens.map(token => this.getPriceKey(token));
            const prices = (await this.redisClient.mGet(keys));
            const result = {};
            tokens.forEach((token, index) => {
                const price = prices[index];
                result[token] = price ? parseFloat(price) : null;
            });
            return result;
        }
        catch (error) {
            console.error("Error getting batch prices from Redis:", error);
            return tokens.reduce((acc, token) => {
                acc[token] = null;
                return acc;
            }, {});
        }
    }
    /**
     * Clear all cache for a specific dex
     */
    async clearDexCache(dexId) {
        try {
            const pattern = `dex:${dexId}:*`;
            const keys = await this.redisClient.keys(pattern);
            if (keys.length > 0) {
                await this.redisClient.del(keys);
            }
        }
        catch (err) {
            console.error(`Error clearing cache for dex ${dexId}:`, err);
        }
    }
    /**
     * Clear all token prices
     */
    async clearAllPrices() {
        try {
            const pattern = 'TOKEN_PRICE:*';
            const keys = await this.redisClient.keys(pattern);
            if (keys.length > 0) {
                await this.redisClient.del(keys);
            }
        }
        catch (error) {
            console.error("Error clearing all prices from Redis:", error);
        }
    }
    /**
     * Get cache statistics
     */
    async getCacheStats() {
        try {
            const [totalKeys, dexKeys, priceKeys] = await Promise.all([
                this.redisClient.dbSize(),
                this.redisClient.keys('dex:*'),
                this.redisClient.keys('TOKEN_PRICE:*')
            ]);
            return {
                totalKeys,
                dexCacheKeys: dexKeys.length,
                priceKeys: priceKeys.length,
            };
        }
        catch (error) {
            console.error("Error getting cache stats:", error);
            return {
                totalKeys: 0,
                dexCacheKeys: 0,
                priceKeys: 0,
            };
        }
    }
    /**
     * Health check for Redis connection
     */
    async healthCheck() {
        try {
            const result = await this.redisClient.ping();
            return result === 'PONG';
        }
        catch (error) {
            console.error("Redis health check failed:", error);
            return false;
        }
    }
    /**
     * Get the underlying Redis client (if needed for advanced operations)
     */
    getClient() {
        return this.redisClient;
    }
}
exports.RedisCacheManager = RedisCacheManager;
// let redisClient: RedisClientType | null = null;
// // Initialize Redis client
// export const initRedisClient = async () => {
//   if (!redisClient) {
//     redisClient = createClient({
//       url: env.REDIS_URL || "redis://localhost:6379",
//       password: env.REDIS_PASSWORD,
//     });
//     redisClient.on("error", (err) => {
//       console.error("Redis client error:", err);
//     });
//     await redisClient.connect();
//   }
//   return redisClient;
// };
// // Get the Redis key for a specific dex and namespace
// const getRedisKey = (dexId: DexIdTypes, namespace: CacheNamespaceType) => {
//   return `dex:${dexId}:${namespace}`;
// };
// // Get data from Redis cache
// export const getDexNamespaceRedisCache = async <T>(
//   dexId: DexIdTypes,
//   namespace: CacheNamespaceType
// ): Promise<T | null> => {
//   try {
//     const client = await initRedisClient();
//     const key = getRedisKey(dexId, namespace);
//     const data = await client.get(key);
//     if (!data) return null;
//     return JSON.parse(data) as T;
//   } catch (err) {
//     console.error(
//       `Error getting ${namespace} from Redis for dex ${dexId}:`,
//       err
//     );
//     return null;
//   }
// };
// // Set data in Redis cache
// export const setDexNamespaceRedisCache = async (
//   dexId: DexIdTypes,
//   namespace: CacheNamespaceType,
//   serializedData: string,
//   expiryInSeconds?: number
// ): Promise<void> => {
//   try {
//     const client = await initRedisClient();
//     const key = getRedisKey(dexId, namespace);
//     if (expiryInSeconds) {
//       await client.setEx(key, expiryInSeconds, serializedData);
//     } else {
//       await client.set(key, serializedData);
//     }
//   } catch (err) {
//     console.error(`Error setting ${namespace} in Redis for dex ${dexId}:`, err);
//   }
// };
// // Delete data from Redis cache
// export const deleteDexNamespaceRedisCache = async (
//   dexId: DexIdTypes,
//   namespace: CacheNamespaceType
// ): Promise<void> => {
//   try {
//     const client = await initRedisClient();
//     const key = getRedisKey(dexId, namespace);
//     await client.del(key);
//   } catch (err) {
//     console.error(
//       `Error deleting ${namespace} from Redis for dex ${dexId}:`,
//       err
//     );
//   }
// };
// // Check if data exists in Redis cache
// export const existsDexNamespaceRedisCache = async (
//   dexId: DexIdTypes,
//   namespace: CacheNamespaceType
// ): Promise<boolean> => {
//   try {
//     const client = await initRedisClient();
//     const key = getRedisKey(dexId, namespace);
//     const exists = await client.exists(key);
//     return exists === 1;
//   } catch (err) {
//     console.error(
//       `Error checking existence of ${namespace} in Redis for dex ${dexId}:`,
//       err
//     );
//     return false;
//   }
// };
// export const setPriceToRedis = async (token: string, price: number) => {
//   try {
//     const client = await initRedisClient();
//     const key = `TOKEN_PRICE:${token}`;
//     await client.set(key, price.toString());
//     await client.expire(key, 60 * 60); // Set expiration to 1 hour
//   } catch (error) {
//     console.error("Error setting price to Redis:", error);
//   }
// };
// export const getPriceFromRedis = async (token: string) => {
//   try {
//     const client = await initRedisClient();
//     const key = `TOKEN_PRICE:${token}`;
//     const price = await client.get(key);
//     if (price) {
//       return parseFloat(price);
//     }
//     return null;
//   } catch (error) {
//     console.error("Error getting price from Redis:", error);
//   }
// };
