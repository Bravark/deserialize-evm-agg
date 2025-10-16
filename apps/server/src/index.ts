
import { DexCache } from "@deserialize-evm-agg/cache";
import { ArrayBiMap, Edge, EdgeData, findBestRouteIndex } from "@deserialize-evm-agg/graph";
import { getChainDexIdList, DeserializeRoutePlan, getChainAllRoute, getChainDexIds, getTokenDetails, IRoute, ZeroGRoute, AllDexIdTypes } from "@deserialize-evm-agg/routes-providers"
import { JsonRpcApiProvider, JsonRpcProvider } from "ethers";
import { createClient, RedisClientType } from "redis"
import { config } from "./config";
import { NetworkType } from "@deserialize-evm-agg/routes-providers/dist/constants";



(BigInt.prototype as any).toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
};





export interface RouteOptions {
    targetRouteNumber: number;
}

// export const getRouteJsonRpcProvider = (dexId: AllDexIdTypes) => {
//     if (dexId === DEX_IDS.ZERO_G) {
//         return ZeroGRoute;
//     } else if (dexId === DEX_IDS.ALL) {
//         return AllRoute;
//     }
//     throw new Error(`No route provider for ${dexId}`);
// };

let cache: DexCache<AllDexIdTypes> | undefined = undefined

export const initAndGetCache = async (): Promise<DexCache<AllDexIdTypes>> => {
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
    network: NetworkType,
    fromTokenString: string,
    toTokenString: string,
    amount: number,
    _provider: JsonRpcProvider,
    options?: RouteOptions
): Promise<{
    routes: DeserializeRoutePlan<AllDexIdTypes>[];
    RouteJsonRpcProvider: IRoute<any, AllDexIdTypes>;
    bestOutcome: number;
}> => {
    const provider = _provider
    const RouteJsonRpcProviderClass = getChainAllRoute(network);
    const cache = await initAndGetCache()
    const RouteJsonRpcProvider = new RouteJsonRpcProviderClass(provider, cache);
    const config = RouteJsonRpcProvider.getDexConfig()

    const { tokenBiMap } = await RouteJsonRpcProvider.getTokenBiMap();
    // console.log('tokenBiMap: ', tokenBiMap);
    const graph = await RouteJsonRpcProvider.getGraph();
    let path: number[][] = [];
    let keyRate;
    // let tokenAUsdRate = await RouteJsonRpcProvider.getTokenPairEdgeData(
    //   new PublicKey(fromTokenString),
    //   new PublicKey(toTokenString)
    // );
    // if (!tokenAUsdRate) {

    keyRate = await RouteJsonRpcProvider.getSurePriceOfToken((fromTokenString));

    // } else {
    //   keyRate = tokenAUsdRate.edgeData.priceUsdc ?? 0;
    //   console.log("keyRate here here: ", keyRate);
    // }

    const nativeAddress = config.nativeTokenAddress

    if (fromTokenString.toLowerCase() === nativeAddress.toLowerCase()) {

        fromTokenString = config.wrappedNativeTokenAddress
    }

    if (toTokenString.toLowerCase() === nativeAddress.toLowerCase()) {

        toTokenString = config.wrappedNativeTokenAddress
    }
    const fromIndex = tokenBiMap.getByValue(fromTokenString.toLowerCase());
    console.log('fromTokenString: ', fromTokenString);
    console.log('fromIndex: ', fromIndex);
    const toIndex = tokenBiMap.getByValue(toTokenString.toLowerCase());
    console.log('toTokenString: ', toTokenString);
    console.log('toIndex: ', toIndex);
    if (fromIndex === undefined || toIndex === undefined) {
        console.log(
            "Token not found in the tokenBiMap: Token Not yet Supported by the Selected Dex"
        );

        throw new Error("DEX_ERRORS.PAIR_NOT_AVAILABLE_ON_DEX");
    }
    const func = RouteJsonRpcProvider.getFunctionToMutateEdgeCost();
    const token = await getTokenDetails(
        (fromTokenString), provider
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
    const routes: DeserializeRoutePlan<AllDexIdTypes>[] = await getRoutePlanFromTokenStringPath(
        tokenStringPath,

    );

    return { routes, RouteJsonRpcProvider: RouteJsonRpcProvider as IRoute<any, AllDexIdTypes>, bestOutcome };
};

export const getRoutePlanFromTokenStringPath = async (
    tokenStringPath: string[][],
): Promise<DeserializeRoutePlan<AllDexIdTypes>[]> => {
    const routes: DeserializeRoutePlan<AllDexIdTypes>[] = [];
    for (const plan of tokenStringPath) {
        const routePlan: DeserializeRoutePlan<AllDexIdTypes> = {
            tokenA: plan[0],
            tokenB: plan[1],
            dexId: plan[2] as AllDexIdTypes,
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
