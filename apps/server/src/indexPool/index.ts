import { DexCache } from "@deserialize-evm-agg/cache";
import { wait, ZeroGRoute } from "@deserialize-evm-agg/routes-providers";
import { config } from "../config";
import { JsonRpcProvider } from "ethers";
import { createClient, RedisClientType } from "redis";
import { checkIfGraphIsEmpty, Edge, EdgeData, Graph } from "@deserialize-evm-agg/graph";
import { cloneDeep } from 'lodash';


(BigInt.prototype as any).toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
};
const chain = {
    name: "0g",
    rpc: "https://evmrpc-testnet.0g.ai"
}
const DEX_IDS = {
    ZERO_G: "ZERO_G",
} as const;
export const dexIdList = Object.keys(DEX_IDS)
export type DexIdTypes = (typeof DEX_IDS)[keyof typeof DEX_IDS];
let cache: DexCache<DexIdTypes> | undefined = undefined



export const initAndGetCache = async (): Promise<DexCache<DexIdTypes>> => {
    if (cache) {
        return cache
    }
    //TODO: switch to redis cache
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
// Solution 1: Custom deep clone function that handles non-cloneable values
function deepCloneGraph<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime()) as T;
    }

    if (obj instanceof Array) {
        return obj.map(item => deepCloneGraph(item)) as T;
    }

    if (typeof obj === 'object') {
        const cloned = {} as T;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                // Skip functions and other non-cloneable values
                if (typeof value === 'function' || value instanceof Element) {
                    continue;
                }
                cloned[key] = deepCloneGraph(value);
            }
        }
        return cloned;
    }

    return obj;
}

// Solution 2: Using JSON parse/stringify (simpler but has limitations)
function jsonDeepClone<T>(obj: T): T {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (error) {
        console.warn('JSON clone failed, falling back to shallow copy:', error);
        return { ...obj } as T;
    }
}

/**
 * Updates empty edge data in the new graph with data from the old graph where edges match
 * @param currentGraph The original graph with edge data to preserve
 * @param updatedGraph The new graph structure whose empty edge data needs to be updated
 * @returns The updated graph with preserved edge data for empty edges
 */
function updateGraphEdgeData(currentGraph: Graph, updatedGraph: Graph): Graph {
    if (currentGraph.length < 1) {
        return updatedGraph;
    }
    // Create a deep copy of the updated graph to avoid modifying the original
    // Try different cloning strategies
    let resultGraph: Graph;

    try {
        // First, try structuredClone with error handling
        resultGraph = structuredClone(currentGraph);
    } catch (error) {
        console.warn('structuredClone failed, using custom deep clone:', error);
        console.log('currentGraph this is the graph that could not be parsed: ', currentGraph);
        try {
            // Fallback to JSON clone
            resultGraph = jsonDeepClone(currentGraph);
        } catch (jsonError) {
            console.warn('JSON clone failed, using custom deep clone:', jsonError);
            // Fallback to custom deep clone
            resultGraph = deepCloneGraph(currentGraph);
        }
    }
    // Create a map for quick lookups of edges in the current graph
    const edgeMap = new Map();

    // Populate the map with all edges from the current graph
    updatedGraph.forEach((edgeList) => {
        edgeList.forEach((edge) => {
            // Create a unique key for each edge based on from and to properties
            const key = `${JSON.stringify(edge.from)}_${JSON.stringify(edge.to)}`;
            edgeMap.set(key, edge.edgeData);
        });
    });
    // Update only empty edges in the result graph where matches are found
    resultGraph.forEach((edgeList: Edge<EdgeData>[], listIndex: number) => {
        edgeList.forEach((edge, edgeIndex: number) => {
            // Check if the edge is empty (you may need to adjust this condition based on how "empty" is defined)
            const isEdgeEmpty = isEmptyEdgeData(edge.edgeData);
            // console.log("isEdgeEmpty: ", isEdgeEmpty);

            // if (isEdgeEmpty) {
            const key = `${JSON.stringify(edge.from)}_${JSON.stringify(edge.to)}`;

            // If this edge exists in the current graph, use its edge data
            //Otherwise, keep the new edge data that came with updatedGraph
            if (edgeMap.has(key)) {
                resultGraph[listIndex][edgeIndex].edgeData = edgeMap.get(key);
            } else {
                resultGraph[listIndex][edgeIndex].edgeData = edge.edgeData;
            }
        });
    });

    return resultGraph;
}

function isEmptyEdgeData(edgeData: EdgeData): boolean {
    // Implement your logic to determine if edge data is empty
    // This could be checking for null, undefined, empty object, specific properties, etc.
    // Example:
    return (
        edgeData === null ||
        edgeData === undefined ||
        (typeof edgeData === "object" && Object.keys(edgeData).length === 0)
    );
}
const updateCacheData = async () => {

    // for (const routeJsonRpcProvider of ALL_ROUTES_PROVIDERS) {

    const provider = new JsonRpcProvider(chain.rpc)
    const cache = await initAndGetCache()
    const route = new ZeroGRoute(provider, cache)
    // console.log('route: ', route);

    const updatedTokenBiMap = await route.getTokenBiMap(provider);
    console.log('updatedTokenBiMap: ', updatedTokenBiMap.tokenBiMap);
    cache.setDexTokenIndexBiMapCache(route.name, updatedTokenBiMap);
    const currentGraph = await route.getGraph(provider);
    // console.log("currentGraph: ", route.name, currentGraph.length);
    const newGraph = await route.getGraph(provider);
    // console.log("newGraph: ", route.name, newGraph);
    const updatedGraph = updateGraphEdgeData(currentGraph, newGraph);
    // console.log("updatedGraph: ", route.name, updatedGraph.length);
    // const isGraphEmpty = checkIfGraphIsEmpty(updatedGraph);
    // console.log("isGraphEmpty: ", route.name, isGraphEmpty);
    // if (!isGraphEmpty) {
    cache.setDexGraphCache(route.name, updatedGraph);
    // }
}


// //
// // it is after that we will update the ALL
// const allRoute = new AllRoute(connection);
// const allUpdatedTokenBiMap = await allRoute.getNewTokenBiMap<any>(connection);
// // console.log("allUpdatedTokenBiMap: ", allUpdatedTokenBiMap.tokenBiMap);
// const allUpdatedGraph = await allRoute.getNewGraph(
//     allUpdatedTokenBiMap,
//     connection
// );
// console.log("allUpdatedGraph: ", allUpdatedGraph.length);
// //TODO: NOT SURE IF I SHOULD CHECK IF GRAPH IS EMPTY
// // if (!isGraphEmpty) {
// setDexTokenIndexBiMapCache(allRoute.name, allUpdatedTokenBiMap as any);
// setDexGraphCache(allRoute.name, allUpdatedGraph);
// }

// const CacheInterval = 0.1; 
// updateCacheData();
// setInterval(async () => {
//     console.log("Updating cache data...");
//     await updateCacheData();
// }, CacheInterval * 60 * 1000); // Convert minutes to milliseconds
const timeTOWaitFor = 2//in seconds
const runOneAfterTheOther = async () => {
    await updateCacheData();
    //wait for awhile
    await wait(timeTOWaitFor)
}

runOneAfterTheOther()