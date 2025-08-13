import { DEX_CACHE_NAMESPACE } from "./constants";
import { ArrayBiMap, Graph } from "@deserialize-evm-agg/graph";
type Cache = Map<any, DexMemoryCache | null>;
type DexMemoryCache = Map<CacheNamespaceType, unknown | null>;
export type CacheNamespaceType = keyof typeof DEX_CACHE_NAMESPACE;
export declare class MemoryCacheManager<DexIdTypes> {
    private cache;
    constructor();
    /**
     * Get the cache for a specific dex
     */
    private getDexMemoryCache;
    /**
     * Get the cache for a specific namespace
     */
    getNamespaceMemoryCache(namespace: CacheNamespaceType, dexId: DexIdTypes): unknown;
    /**
     * Set the cache for a specific namespace
     */
    setNamespaceMemoryCache(namespace: CacheNamespaceType, dexId: DexIdTypes, value: unknown): void;
    /**
     * Get the cache for a specific token index bi map
     */
    getTokenIndexBiMapMemoryCache(dexId: DexIdTypes): ArrayBiMap<string>;
    /**
     * Set the cache for a specific token index bi map
     */
    setTokenIndexBiMapMemoryCache(dexId: DexIdTypes, tokenBiMap: ArrayBiMap<string>): void;
    /**
     * Get the cache for a specific token pool map
     */
    getTokenPoolMapMemoryCache(dexId: DexIdTypes): Map<string, string>;
    /**
     * Set the cache for a specific token pool map
     */
    setTokenPoolMapMemoryCache(dexId: DexIdTypes, tokenPoolMapMemoryCache: Map<string, string>): void;
    /**
     * Get the cache for a specific token mint map
     */
    getTokenMintMapMemoryCache(dexId: DexIdTypes): Map<string, string>;
    /**
     * Set the cache for a specific token mint map
     */
    setTokenMintMapMemoryCache(dexId: DexIdTypes, tokenMintMapMemoryCache: Map<string, string>): void;
    /**
     * Get the cache for a dex graph
     */
    getGraphMemoryCache(dexId: DexIdTypes): Graph;
    /**
     * Set the cache for a dex graph
     */
    setGraphMemoryCache(dexId: DexIdTypes, graph: Graph): void;
    /**
     * Clear all cache for a specific dex
     */
    clearDexCache(dexId: DexIdTypes): void;
    /**
     * Clear specific namespace cache for a dex
     */
    clearNamespaceCache(namespace: CacheNamespaceType, dexId: DexIdTypes): void;
    /**
     * Clear all cache
     */
    clearAllCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        totalDexes: number;
        totalNamespaces: number;
    };
}
export declare const defaultMemoryCache: MemoryCacheManager<unknown>;
export declare const MemoryCache: Cache;
export {};
