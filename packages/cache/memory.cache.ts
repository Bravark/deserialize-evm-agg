

import { get } from "http";
import { DEX_CACHE_NAMESPACE } from "./constants";

import { ArrayBiMap, Graph } from "@deserialize-evm-agg/graph"

// Types
type Cache = Map<any, DexMemoryCache | null>;
type DexMemoryCache = Map<CacheNamespaceType, unknown | null>;
export type CacheNamespaceType = keyof typeof DEX_CACHE_NAMESPACE;

export class MemoryCacheManager<DexIdTypes> {
  private cache: Cache;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Get the cache for a specific dex
   */
  private getDexMemoryCache(dexId: DexIdTypes): DexMemoryCache | null | undefined {
    if (!this.cache.has(dexId)) {
      this.cache.set(dexId, null);
    }
    return this.cache.get(dexId);
  }

  /**
   * Get the cache for a specific namespace
   */
  getNamespaceMemoryCache(namespace: CacheNamespaceType, dexId: DexIdTypes): unknown {
    let dexMemoryCache: DexMemoryCache = new Map();
    const _dexMemoryCache = this.getDexMemoryCache(dexId);

    if (_dexMemoryCache) {
      dexMemoryCache = _dexMemoryCache;
    } else {
      dexMemoryCache.set(namespace, null);
      this.cache.set(dexId, dexMemoryCache);
    }

    return dexMemoryCache.get(namespace);
  }

  /**
   * Set the cache for a specific namespace
   */
  setNamespaceMemoryCache(
    namespace: CacheNamespaceType,
    dexId: DexIdTypes,
    value: unknown
  ): void {
    let dexMemoryCache: DexMemoryCache = new Map();
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
  getTokenIndexBiMapMemoryCache(dexId: DexIdTypes): ArrayBiMap<string> {
    return this.getNamespaceMemoryCache(
      DEX_CACHE_NAMESPACE.TOKEN_INDEX_BI_MAP as CacheNamespaceType,
      dexId
    ) as ArrayBiMap<string>;
  }

  /**
   * Set the cache for a specific token index bi map
   */
  setTokenIndexBiMapMemoryCache(dexId: DexIdTypes, tokenBiMap: ArrayBiMap<string>): void {
    this.setNamespaceMemoryCache(
      DEX_CACHE_NAMESPACE.TOKEN_INDEX_BI_MAP as CacheNamespaceType,
      dexId,
      tokenBiMap
    );
  }

  /**
   * Get the cache for a specific token pool map
   */
  getTokenPoolMapMemoryCache(dexId: DexIdTypes): Map<string, string> {
    return this.getNamespaceMemoryCache(
      DEX_CACHE_NAMESPACE.TOKEN_POOL_MAP as CacheNamespaceType,
      dexId
    ) as Map<string, string>;
  }

  /**
   * Set the cache for a specific token pool map
   */
  setTokenPoolMapMemoryCache(dexId: DexIdTypes, tokenPoolMapMemoryCache: Map<string, string>): void {
    this.setNamespaceMemoryCache(
      DEX_CACHE_NAMESPACE.TOKEN_POOL_MAP as CacheNamespaceType,
      dexId,
      tokenPoolMapMemoryCache
    );
  }

  /**
   * Get the cache for a specific token mint map
   */
  getTokenMintMapMemoryCache(dexId: DexIdTypes): Map<string, string> {
    return this.getNamespaceMemoryCache(
      DEX_CACHE_NAMESPACE.TOKEN_MINT_MAP as CacheNamespaceType,
      dexId
    ) as Map<string, string>;
  }

  /**
   * Set the cache for a specific token mint map
   */
  setTokenMintMapMemoryCache(dexId: DexIdTypes, tokenMintMapMemoryCache: Map<string, string>): void {
    this.setNamespaceMemoryCache(
      DEX_CACHE_NAMESPACE.TOKEN_MINT_MAP as CacheNamespaceType,
      dexId,
      tokenMintMapMemoryCache
    );
  }

  /**
   * Get the cache for a dex graph
   */
  getGraphMemoryCache(dexId: DexIdTypes): Graph {
    return this.getNamespaceMemoryCache(
      DEX_CACHE_NAMESPACE.GRAPH as CacheNamespaceType,
      dexId
    ) as Graph;
  }

  /**
   * Set the cache for a dex graph
   */
  setGraphMemoryCache(dexId: DexIdTypes, graph: Graph): void {
    this.setNamespaceMemoryCache(
      DEX_CACHE_NAMESPACE.GRAPH as CacheNamespaceType,
      dexId,
      graph
    );
  }

  getLastBlockFetchedCache(dexId: DexIdTypes): number | null {
    return this.getNamespaceMemoryCache(
      DEX_CACHE_NAMESPACE.LAST_BLOCK_FETCHED as CacheNamespaceType,
      dexId
    ) as number | null;
  }

  setLastBlockFetchedCache(dexId: DexIdTypes, blockNumber: number): void {
    this.setNamespaceMemoryCache(
      DEX_CACHE_NAMESPACE.LAST_BLOCK_FETCHED as CacheNamespaceType,
      dexId,
      blockNumber
    );
  }

  /**
   * Clear all cache for a specific dex
   */
  clearDexCache(dexId: DexIdTypes): void {
    this.cache.delete(dexId);
  }

  /**
   * Clear specific namespace cache for a dex
   */
  clearNamespaceCache(namespace: CacheNamespaceType, dexId: DexIdTypes): void {
    const dexCache = this.getDexMemoryCache(dexId);
    if (dexCache) {
      dexCache.delete(namespace);
    }
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { totalDexes: number, totalNamespaces: number } {
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

// Export a default instance for backward compatibility
export const defaultMemoryCache = new MemoryCacheManager();

// Export the global cache for backward compatibility
export const MemoryCache: Cache = new Map();

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