"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoutePlanFromTokenStringPath = exports.getBestRoutes = exports.initAndGetCache = exports.getRouteJsonRpcProvider = exports.dexIdList = exports.DEX_IDS = void 0;
const cache_1 = require("@deserialize-evm-agg/cache");
const graph_1 = require("@deserialize-evm-agg/graph");
const routes_providers_1 = require("@deserialize-evm-agg/routes-providers");
const redis_1 = require("redis");
const config_1 = require("./config");
BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
};
exports.DEX_IDS = {
    ZERO_G: "ZERO_G",
};
exports.dexIdList = Object.keys(exports.DEX_IDS);
const getRouteJsonRpcProvider = (dexId) => {
    if (dexId === exports.DEX_IDS.ZERO_G) {
        return routes_providers_1.ZeroGRoute;
    }
    throw new Error(`No route provider for ${dexId}`);
};
exports.getRouteJsonRpcProvider = getRouteJsonRpcProvider;
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
const getBestRoutes = async (dexId, fromTokenString, toTokenString, amount, _provider, options) => {
    const provider = _provider;
    const RouteJsonRpcProviderClass = (0, exports.getRouteJsonRpcProvider)(dexId);
    const cache = await (0, exports.initAndGetCache)();
    const RouteJsonRpcProvider = new RouteJsonRpcProviderClass(provider, cache);
    // console.log("getting token bi map...");
    const { tokenBiMap } = await RouteJsonRpcProvider.getTokenBiMap();
    // console.log('tokenBiMap: ', tokenBiMap);
    // console.log("getting graph...");
    const graph = await RouteJsonRpcProvider.getGraph();
    let path = [];
    let keyRate;
    // let tokenAUsdRate = await RouteJsonRpcProvider.getTokenPairEdgeData(
    //   new PublicKey(fromTokenString),
    //   new PublicKey(toTokenString)
    // );
    // if (!tokenAUsdRate) {
    keyRate = await RouteJsonRpcProvider.calculator.getSureTokenPrice((fromTokenString), provider);
    // } else {
    //   keyRate = tokenAUsdRate.edgeData.priceUsdc ?? 0;
    //   console.log("keyRate here here: ", keyRate);
    // }
    // console.log("graph: ", graph[0]);
    const fromIndex = tokenBiMap.getByValue(fromTokenString);
    const toIndex = tokenBiMap.getByValue(toTokenString);
    if (fromIndex === undefined || toIndex === undefined) {
        console.log("Token not found in the tokenBiMap: Token Not yet Supported by the Selected Dex");
        console.log("tokenBiMap: ", tokenBiMap);
        throw new Error("DEX_ERRORS.PAIR_NOT_AVAILABLE_ON_DEX");
    }
    const func = RouteJsonRpcProvider.getFunctionToMutateEdgeCost();
    const token = await RouteJsonRpcProvider.calculator.getTokenDetails((fromTokenString));
    const { bestRoute: _path, edgeData, bestOutcome, } = (0, graph_1.findBestRouteIndex)(graph, fromIndex, toIndex, { key: amount, keyRate: keyRate ?? 0, keyDecimal: token.decimals }, options?.targetRouteNumber, func);
    console.log('_path: ', _path);
    path = _path;
    if (path.length < 1) {
        console.log("No route found");
        throw new Error("No route found");
    }
    const tokenStringPath = convertEdgeListToTokenString(edgeData, tokenBiMap);
    // console.log("tokenStringPath: ", { tokenStringPath });
    // console.log("getting route plan from string...");
    const routes = await (0, exports.getRoutePlanFromTokenStringPath)(tokenStringPath, dexId);
    return { routes, RouteJsonRpcProvider, bestOutcome };
};
exports.getBestRoutes = getBestRoutes;
const getRoutePlanFromTokenStringPath = async (tokenStringPath, dexId) => {
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
