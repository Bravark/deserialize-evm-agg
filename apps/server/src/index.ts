
import { DexCache } from "@deserialize-evm-agg/cache";
import { ArrayBiMap, Edge, EdgeData, findBestRouteIndex } from "@deserialize-evm-agg/graph";
import { DeserializeRoutePlan, IRoute, ZeroGRoute } from "@deserialize-evm-agg/routes-providers"
import { JsonRpcApiProvider, JsonRpcProvider } from "ethers";
import { createClient, RedisClientType } from "redis"
import { config } from "./config";


(BigInt.prototype as any).toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
};

export const DEX_IDS = {
    ZERO_G: "ZERO_G",
} as const;
export const dexIdList = Object.keys(DEX_IDS)
export type DexIdTypes = (typeof DEX_IDS)[keyof typeof DEX_IDS];

export interface RouteOptions {
    targetRouteNumber: number;
}

export const getRouteJsonRpcProvider = (dexId: DexIdTypes) => {
    if (dexId === DEX_IDS.ZERO_G) {
        return ZeroGRoute;
    }
    throw new Error(`No route provider for ${dexId}`);
};

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

export const getBestRoutes = async (
    dexId: DexIdTypes,
    fromTokenString: string,
    toTokenString: string,
    amount: number,
    _provider: JsonRpcProvider,
    options?: RouteOptions
): Promise<{
    routes: DeserializeRoutePlan<DexIdTypes>[];
    RouteJsonRpcProvider: IRoute<any, DexIdTypes>;
    bestOutcome: number;
}> => {
    const provider = _provider
    const RouteJsonRpcProviderClass = getRouteJsonRpcProvider(dexId);
    const cache = await initAndGetCache()
    const RouteJsonRpcProvider = new RouteJsonRpcProviderClass(provider, cache);
    // console.log("getting token bi map...");
    const { tokenBiMap } = await RouteJsonRpcProvider.getTokenBiMap();
    // console.log('tokenBiMap: ', tokenBiMap);
    // console.log("getting graph...");
    const graph = await RouteJsonRpcProvider.getGraph();
    let path: number[][] = [];
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
        console.log(
            "Token not found in the tokenBiMap: Token Not yet Supported by the Selected Dex"
        );
        console.log("tokenBiMap: ", tokenBiMap);
        throw new Error("DEX_ERRORS.PAIR_NOT_AVAILABLE_ON_DEX");
    }
    const func = RouteJsonRpcProvider.getFunctionToMutateEdgeCost();
    const token = await RouteJsonRpcProvider.calculator.getTokenDetails(
        (fromTokenString),
    );
    const {
        bestRoute: _path,
        edgeData,
        bestOutcome,
    } = findBestRouteIndex(
        graph,
        fromIndex,
        toIndex,
        { key: amount, keyRate: keyRate ?? 0, keyDecimal: token.decimals },
        options?.targetRouteNumber,
        func
    );
    console.log('_path: ', _path);
    path = _path;

    if (path.length < 1) {
        console.log("No route found");
        throw new Error("No route found");
    }
    const tokenStringPath = convertEdgeListToTokenString(edgeData, tokenBiMap);

    // console.log("tokenStringPath: ", { tokenStringPath });
    // console.log("getting route plan from string...");
    const routes: DeserializeRoutePlan<DexIdTypes>[] = await getRoutePlanFromTokenStringPath(
        tokenStringPath,
        dexId
    );

    return { routes, RouteJsonRpcProvider, bestOutcome };
};

export const getRoutePlanFromTokenStringPath = async (
    tokenStringPath: string[][],
    dexId: DexIdTypes
): Promise<DeserializeRoutePlan<DexIdTypes>[]> => {
    const routes: DeserializeRoutePlan<DexIdTypes>[] = [];
    for (const plan of tokenStringPath) {
        const routePlan: DeserializeRoutePlan<DexIdTypes> = {
            tokenA: plan[0],
            tokenB: plan[1],
            dexId: plan[2] as DexIdTypes,
            poolAddress: plan[3],
            aToB: plan[4] === "aToB" ? true : false,
            fee: parseInt(plan[5], 10)
        };
        routes.push(routePlan);
    }

    return routes;
};

const convertEdgeListToTokenString = (
    edges: Edge<EdgeData>[],
    tokenBiMap: ArrayBiMap<string>
): string[][] => {
    // console.log("path: ", edges);
    // console.log("tokenBiMap: ", tokenBiMap);
    return edges.map((edge) => {
        return [
            tokenBiMap.get(edge.from)!,
            tokenBiMap.get(edge.to)!,
            edge.edgeData.dexId,
            edge.edgeData.poolAddress,
            edge.edgeData.aToB ? "aToB" : "bToA",
            edge.edgeData.fee.toString()
        ];
    });
};
