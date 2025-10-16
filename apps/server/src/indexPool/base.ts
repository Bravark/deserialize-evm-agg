import { DexCache } from "@deserialize-evm-agg/cache";
import { wait, ZeroGRoute, getChainAllRoute, ZiaRoute, getChainDexIds, getChainDexIdList, PancakeV3Route, AerodromeV3Route, UniswapV3BaseRoute, } from "@deserialize-evm-agg/routes-providers";
import { config } from "../config";
import { JsonRpcProvider } from "ethers";
import { createClient, RedisClientType } from "redis";
import { checkIfGraphIsEmpty, Edge, EdgeData, Graph } from "@deserialize-evm-agg/graph";



(BigInt.prototype as any).toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
};

let cache: DexCache<any> | undefined = undefined

const initAndGetCache = async <T>(): Promise<DexCache<T>> => {
    if (cache) {
        return cache
    }
    const redisClient = createClient({
        url: config.REDIS_URL
    })

    await redisClient.connect()


    const newCache = new DexCache({
        storageDestination: "REDIS",
        redisClient: redisClient as any as RedisClientType

    })
    cache = newCache
    return cache

}

const updateCacheData = async (rpc: string) => {
    const provider = new JsonRpcProvider(rpc);
    const cache = await initAndGetCache();
    const AllRoute = getChainAllRoute("BASE");
    const allRoute = new AllRoute(provider, cache);

    console.log("=== Starting Cache Update ===");

    try {
        // ========== STEP 1: Update Individual Route Caches ==========
        await Promise.all(allRoute.routeProviders.map(async (routeJsonRpcProvider) => {
            const routeName = new routeJsonRpcProvider(provider, cache).name;
            console.log(`\n--- Processing route: ${routeName} ---`);

            try {
                const route = new routeJsonRpcProvider(provider, cache);

                // Get existing data from cache
                const existingTokenBiMap = await cache.getDexTokenIndexBiMapCache(
                    route.name,
                    route.formatPool
                );
                const existingGraph = await cache.getDexGraphCache(route.name);

                // Get ONLY new pools since last block
                const newPoolData = await route.getNewTokenBiMap(provider);

                if (!newPoolData.data || newPoolData.data.length === 0) {
                    console.log(`No new pools found for ${route.name}, skipping update`);
                    return;
                }

                console.log(`Found ${newPoolData.data.length} new pools for ${route.name}`);

                // Merge token BiMaps
                const mergedTokenBiMap = existingTokenBiMap
                    ? route.mergeTokenBiMaps(existingTokenBiMap.tokenBiMap, newPoolData.tokenBiMap)
                    : newPoolData.tokenBiMap;

                console.log(`Token BiMap size: ${existingTokenBiMap?.tokenBiMap.toArray().length || 0} → ${mergedTokenBiMap.toArray().length}`);

                // Build graph ONLY from new pools
                const newEdgesGraph = await route.buildGraphFromPools(
                    newPoolData.data,
                    mergedTokenBiMap,
                    provider
                );

                // Merge with existing graph
                const updatedGraph = existingGraph
                    ? route.mergeGraphs(existingGraph, newEdgesGraph, mergedTokenBiMap)
                    : newEdgesGraph;

                const isGraphEmpty = checkIfGraphIsEmpty(updatedGraph);
                console.log(`Graph empty check for ${route.name}:`, isGraphEmpty);

                if (!isGraphEmpty) {
                    // Update cache with merged data
                    await cache.setDexTokenIndexBiMapCache(route.name, {
                        tokenBiMap: mergedTokenBiMap,
                        data: newPoolData.data, // Store reference to new pools
                        tokenPoolMap: newPoolData.tokenPoolMap
                    });
                    await cache.setDexGraphCache(route.name, updatedGraph);
                    console.log(`✓ Successfully updated cache for ${route.name}`);
                } else {
                    console.warn(`✗ Graph is empty for ${route.name}, not updating cache`);
                }

            } catch (error) {
                console.error(`Error updating route ${routeName}:`, error);
            }
        }));

        console.log("\n=== Individual Routes Updated ===");

        // ========== STEP 2: Update Aggregated Route Cache ==========
        console.log("\n--- Updating aggregated route ---");

        try {
            // Get existing aggregated data
            const existingAllTokenBiMap = await cache.getDexTokenIndexBiMapCache(
                allRoute.name,
                allRoute.formatPool
            );
            const existingAllGraph = await cache.getDexGraphCache(allRoute.name);

            // Get new pools from all DEXes
            const allNewPoolData = await allRoute.getNewTokenBiMapIncremental(provider);

            const totalNewPools = Array.from(allNewPoolData.data.values())
                .reduce((sum, pools) => sum + pools.length, 0);

            if (totalNewPools === 0) {
                console.log("No new pools found across all DEXes, skipping aggregated update");
                return;
            }

            console.log(`Found ${totalNewPools} new pools across ${allNewPoolData.data.size} DEXes`);

            // Merge token BiMaps
            const mergedAllTokenBiMap = existingAllTokenBiMap
                ? allRoute.mergeTokenBiMaps(existingAllTokenBiMap.tokenBiMap, allNewPoolData.tokenBiMap)
                : allNewPoolData.tokenBiMap;

            console.log(`Aggregated Token BiMap size: ${existingAllTokenBiMap?.tokenBiMap.toArray().length || 0} → ${mergedAllTokenBiMap.toArray().length}`);

            // Build graph only from new pools
            const newAggregatedEdges = await allRoute.buildGraphFromPools(
                [],
                mergedAllTokenBiMap,
                provider,
                allNewPoolData.data,
            );

            // Merge with existing aggregated graph
            const updatedAllGraph = existingAllGraph
                ? allRoute.mergeGraphs(existingAllGraph, newAggregatedEdges, mergedAllTokenBiMap)
                : newAggregatedEdges;

            console.log(`Aggregated graph size: ${updatedAllGraph.length}`);

            const isAllGraphEmpty = checkIfGraphIsEmpty(updatedAllGraph);
            console.log("Aggregated graph empty check:", isAllGraphEmpty);

            if (!isAllGraphEmpty) {
                // Convert Map to entries for storage
                const dataEntries = Array.from(allNewPoolData.data.entries());

                await cache.setDexTokenIndexBiMapCache(allRoute.name, {
                    tokenBiMap: mergedAllTokenBiMap,
                    data: dataEntries as any,
                    tokenPoolMap: allNewPoolData.tokenPoolMap
                });
                await cache.setDexGraphCache(allRoute.name, updatedAllGraph);
                console.log("✓ Successfully updated aggregated cache");
            } else {
                console.warn("✗ Aggregated graph is empty, not updating cache");
            }

        } catch (error) {
            console.error("Error updating aggregated route:", error);
        }

        console.log("\n=== Cache Update Complete ===");

    } catch (error) {
        console.error("Critical error in updateCacheData:", error);
        throw error;
    }
};

// ========== Setup and Execution ==========
const CacheInterval = 1; // minutes
const chain = {
    name: "BASE",
    rpc: "https://base-mainnet.g.alchemy.com/v2/Afwsc8tOtKoTwYvd4M4UeyIOFTrKt-fy"
};

let isUpdating = false;
let intervalId: NodeJS.Timeout | null = null;

// Wrapper to prevent overlapping updates
const safeUpdateCacheData = async (rpc: string) => {
    if (isUpdating) {
        console.log("Update already in progress, skipping...");
        return;
    }

    isUpdating = true;
    try {
        await updateCacheData(rpc);
    } catch (error) {
        console.error("Error during cache update:", error);
    } finally {
        isUpdating = false;
    }
};

// Initial update
console.log("Running initial cache update...");
safeUpdateCacheData(chain.rpc).catch(console.error);

// Set up interval
intervalId = setInterval(async () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Scheduled cache update - ${new Date().toISOString()}`);
    console.log('='.repeat(60));
    await safeUpdateCacheData(chain.rpc);
}, CacheInterval * 60 * 1000);

// Cleanup function (call this when shutting down)
export const stopCacheUpdates = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log("Cache update interval stopped");
    }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    stopCacheUpdates();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nShutting down gracefully...');
    stopCacheUpdates();
    process.exit(0);
});