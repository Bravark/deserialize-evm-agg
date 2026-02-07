"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoutePlanFromTokenStringPath = exports.getBestRoutes = exports.initAndGetCache = void 0;
const cache_1 = require("@deserialize-evm-agg/cache");
const graph_1 = require("@deserialize-evm-agg/graph");
const routes_providers_1 = require("@deserialize-evm-agg/routes-providers");
const redis_1 = require("redis");
const config_1 = require("./config");
const errors_api_1 = require("./errors/errors.api");
BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
};
// export const getRouteJsonRpcProvider = (dexId: AllDexIdTypes) => {
//     if (dexId === DEX_IDS.ZERO_G) {
//         return ZeroGRoute;
//     } else if (dexId === DEX_IDS.ALL) {
//         return AllRoute;
//     }
//     throw new Error(`No route provider for ${dexId}`);
// };
let cache = undefined;
const initAndGetCache = async () => {
    if (cache) {
        return cache;
    }
    //TODO: switch to redis cache
    const redisClient = (0, redis_1.createClient)({
        url: config_1.config.REDIS_URL
    });
    await redisClient.connect();
    const newCache = new cache_1.DexCache({
        storageDestination: "REDIS",
        redisClient: redisClient
    });
    cache = newCache;
    return cache;
};
exports.initAndGetCache = initAndGetCache;
const getBestRoutes = async (network, fromTokenString, toTokenString, amount, _provider, options) => {
    const provider = _provider;
    const RouteJsonRpcProviderClass = (0, routes_providers_1.getChainAllRoute)(network);
    const cache = await (0, exports.initAndGetCache)();
    const RouteJsonRpcProvider = new RouteJsonRpcProviderClass(provider, cache);
    const config = RouteJsonRpcProvider.getDexConfig();
    let { tokenBiMap } = await RouteJsonRpcProvider.getTokenBiMap();
    let graph = await RouteJsonRpcProvider.getGraph();
    let path = [];
    let keyRate;
    keyRate = await RouteJsonRpcProvider.getSurePriceOfToken((fromTokenString));
    // } else {
    //   keyRate = tokenAUsdRate.edgeData.priceUsdc ?? 0;
    //   console.log("keyRate here here: ", keyRate);
    // }
    const nativeAddress = config.nativeTokenAddress;
    if (fromTokenString.toLowerCase() === nativeAddress.toLowerCase()) {
        fromTokenString = config.wrappedNativeTokenAddress;
    }
    if (toTokenString.toLowerCase() === nativeAddress.toLowerCase()) {
        toTokenString = config.wrappedNativeTokenAddress;
    }
    let fromIndex = tokenBiMap.getByValue(fromTokenString.toLowerCase());
    let toIndex = tokenBiMap.getByValue(toTokenString.toLowerCase());
    if (fromIndex === undefined || toIndex === undefined) {
        console.log("Token not found in the tokenBiMap: Token Not yet Supported by the Selected Dex");
        //TRYING TO ADD THE TOKEN PAIR TO THE GRAPH
        const { newGraph, newTokenBiMap } = await RouteJsonRpcProvider.findUpdateTokenPairPools(fromTokenString, toTokenString);
        tokenBiMap = newTokenBiMap;
        graph = newGraph;
        fromIndex = tokenBiMap.getByValue(fromTokenString.toLowerCase());
        toIndex = tokenBiMap.getByValue(toTokenString.toLowerCase());
        if (fromIndex === undefined || toIndex === undefined) {
            throw new Error("Token Not yet Supported by the Selected Dex");
        }
    }
    //sometimes the token might be in the token bi map but does not have any graph edges 
    //verify that
    const fromEdges = graph[fromIndex];
    const toEdges = graph[toIndex];
    if (fromEdges.length === 0 || toEdges.length === 0) {
        const { newGraph, newTokenBiMap } = await RouteJsonRpcProvider.findUpdateTokenPairPools(fromTokenString, toTokenString);
        tokenBiMap = newTokenBiMap;
        graph = newGraph;
        if (fromEdges.length === 0 || toEdges.length === 0) {
            throw new errors_api_1.ApiError(400, "No Route found for this token Pair");
        }
    }
    const func = RouteJsonRpcProvider.getFunctionToMutateEdgeCost();
    const token = await (0, routes_providers_1.getTokenDetails)((fromTokenString), provider);
    const { bestRoute: _path, edgeData, bestOutcome, } = (0, graph_1.findBestRouteIndex)(graph, fromIndex, toIndex, { key: amount, keyRate: keyRate ?? 0, keyDecimal: token.decimals }, options?.targetRouteNumber, func);
    path = _path;
    if (path.length < 1) {
        console.log("No route found");
        throw new Error("No route found");
    }
    const tokenStringPath = convertEdgeListToTokenString(edgeData, tokenBiMap);
    // console.log("tokenStringPath: ", { tokenStringPath });
    // console.log("getting route plan from string...");
    const routes = await (0, exports.getRoutePlanFromTokenStringPath)(tokenStringPath);
    return { routes, RouteJsonRpcProvider: RouteJsonRpcProvider, bestOutcome };
};
exports.getBestRoutes = getBestRoutes;
const getRoutePlanFromTokenStringPath = async (tokenStringPath) => {
    const routes = [];
    for (const plan of tokenStringPath) {
        const routePlan = {
            tokenA: plan[0],
            tokenB: plan[1],
            dexId: plan[2],
            poolAddress: plan[3],
            aToB: plan[4] === "aToB" ? true : false,
            fee: parseInt(plan[5], 10)
        };
        routes.push(routePlan);
    }
    return routes;
};
exports.getRoutePlanFromTokenStringPath = getRoutePlanFromTokenStringPath;
const convertEdgeListToTokenString = (edges, tokenBiMap) => {
    // console.log("path: ", edges);
    // console.log("tokenBiMap: ", tokenBiMap);
    return edges.map((edge) => {
        return [
            tokenBiMap.get(edge.from),
            tokenBiMap.get(edge.to),
            edge.edgeData.dexId,
            edge.edgeData.poolAddress,
            edge.edgeData.aToB ? "aToB" : "bToA",
            edge.edgeData.fee.toString()
        ];
    });
};
