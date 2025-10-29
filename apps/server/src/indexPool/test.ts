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
    const provider = new JsonRpcProvider(rpc)
    const AllRoute = getChainAllRoute("BASE")

    const allRoute = new AllRoute(provider, await initAndGetCache());
    const cache = await initAndGetCache();




    await Promise.all(allRoute.routeProviders.map(async (routeJsonRpcProvider) => {

        const route = new routeJsonRpcProvider(provider, cache)


        const updatedTokenBiMap = await route.getNewTokenBiMap(provider);
        allRoute.cache.setDexTokenIndexBiMapCache(route.name, updatedTokenBiMap);

        const newGraph = await route.getNewGraph(updatedTokenBiMap, provider);

        const isGraphEmpty = checkIfGraphIsEmpty(newGraph);
        console.log("isGraphEmpty: ", route.name, isGraphEmpty);
        if (!isGraphEmpty) {
            allRoute.cache.setDexGraphCache(route.name as any as string, newGraph);
        }
    }))


    const allUpdatedTokenBiMap = await allRoute.getNewTokenBiMap<any>(provider);
    // console.log("allUpdatedTokenBiMap: ", allUpdatedTokenBiMap.tokenBiMap);
    const allUpdatedGraph = await allRoute.getNewGraph(
        allUpdatedTokenBiMap,
        provider
    );
    console.log("allUpdatedGraph: ", allUpdatedGraph.length);
    const isAllGraphEmpty = checkIfGraphIsEmpty(allUpdatedGraph);
    console.log("isAllGraphEmpty: ", allRoute.name, isAllGraphEmpty);
    if (!isAllGraphEmpty) {
        allRoute.cache.setDexTokenIndexBiMapCache(allRoute.name as any as string, allUpdatedTokenBiMap as any);
        allRoute.cache.setDexGraphCache(allRoute.name as any as string, allUpdatedGraph);
    }
}

// const singleRoute = async (rpc: string) => {
//     const provider = new JsonRpcProvider(rpc)
//     const cache = await initAndGetCache();
//     const pancakeRoute = new UniswapV3BaseRoute(provider, cache);
//     const updatedTokenBiMap = await pancakeRoute.getNewTokenBiMap<any>(provider);
//     console.log('updatedTokenBiMap: ', updatedTokenBiMap);
//     pancakeRoute.cache.setDexTokenIndexBiMapCache(pancakeRoute.name, updatedTokenBiMap);
//     const newGraph = await pancakeRoute.getNewGraph(updatedTokenBiMap, provider);
//     const isGraphEmpty = checkIfGraphIsEmpty(newGraph);
//     console.log("isGraphEmpty: ", pancakeRoute.name, isGraphEmpty);
//     // if (!isGraphEmpty) {
//     pancakeRoute.cache.setDexGraphCache(pancakeRoute.name as any as string, newGraph);

// }

const CacheInterval = 1;
const chain = {
    name: "BASE",
    rpc: "https://base-mainnet.g.alchemy.com/v2/pwvhaDUZ4qZ8Oy2QcyWfCQa_avpkVPnL"
}
updateCacheData(chain.rpc);