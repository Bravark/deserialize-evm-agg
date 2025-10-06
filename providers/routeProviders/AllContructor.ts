import { DexCache } from "@deserialize-evm-agg/cache";
import { ArrayBiMap, Edge, FunctionToMutateTheEdgeCostType, Graph, TokenBiMap } from "@deserialize-evm-agg/graph";
import { NetworkType } from "deserialize-evm-server-sdk";
import { JsonRpcProvider } from "ethers";

import { DeserializeRoutePlan, IRoute } from "./IRoute";
import Decimal from "decimal.js";
import { RouteConstructor } from "./v3Route";
import { UniswapV3QuoteCalculator } from "./UniswapV3Calculator";

export type AllRouteConstructor<DexIdTypes extends string> = new (
    provider: JsonRpcProvider,
    cache: DexCache<DexIdTypes>
) => AllRoute<DexIdTypes>;

export const createAllRoute = <DexIdTypes extends string>(
    network: NetworkType,
    routeProviders: RouteConstructor<DexIdTypes>[]
): AllRouteConstructor<DexIdTypes> => {
    return class ConfiguredAllRoute extends AllRoute<DexIdTypes> {
        constructor(provider: JsonRpcProvider, cache: DexCache<DexIdTypes>) {
            super(provider, cache, network, routeProviders);
        }
    };
};

export class AllRoute<DexIdTypes extends string> implements IRoute<any, DexIdTypes> {
    name = "ALL" as DexIdTypes;
    provider: JsonRpcProvider;
    cache: DexCache<DexIdTypes>;
    network: NetworkType;

    routeProviders: RouteConstructor<DexIdTypes>[];

    constructor(
        provider: JsonRpcProvider,
        cache: DexCache<DexIdTypes>,
        network: NetworkType,
        routeProviders: RouteConstructor<DexIdTypes>[]
    ) {
        this.provider = provider;
        this.cache = cache;
        this.network = network;
        this.routeProviders = routeProviders;

    }

    // Helper to get route provider by dexId
    getRouteProviderByDexId = (dexId: string): RouteConstructor<DexIdTypes> => {
        const RouteClass = this.routeProviders.find((RouteProviderClass) => {
            const tempInstance = new RouteProviderClass(this.provider, this.cache);
            return tempInstance.name === dexId;
        });

        if (!RouteClass) {
            throw new Error(`Route provider not found for dexId: ${dexId}`);
        }

        return RouteClass;
    };
    // method to get all supported DEX IDs
    getSupportedDexIds = (): DexIdTypes[] => {
        return this.routeProviders.map((RouteClass) => {
            const tempInstance = new RouteClass(this.provider, this.cache);
            return tempInstance.name;
        });
    };

    static formatPool = (data: [string, any], routeProviders: RouteConstructor<any>[]) => {
        const formattedPoolData: any[] = [];
        const [dexId, poolData] = data;

        // Find the appropriate route provider
        const RouteProviderClass = routeProviders.find((RouteClass) => {
            const temp = new RouteClass(new JsonRpcProvider(), {} as any);
            return temp.name === dexId;
        });

        if (!RouteProviderClass) {
            throw new Error(`Route provider not found for dexId: ${dexId}`);
        }

        const routeProvider = new RouteProviderClass(new JsonRpcProvider(), {} as any);

        poolData.forEach((pool: any) => {
            const formattedData = routeProvider.formatPool(pool);
            formattedPoolData.push(formattedData);
        });

        return [dexId, formattedPoolData];
    };
    // Static method to get DEX IDs without instantiating AllRoute
    static getSupportedDexIds = <T extends string>(
        routeProviders: RouteConstructor<T>[],
        provider: JsonRpcProvider,
        cache: DexCache<T>
    ): T[] => {
        return routeProviders.map((RouteClass) => {
            const tempInstance = new RouteClass(provider, cache);
            return tempInstance.name;
        });
    };

    formatPool = (pool: any) => {
        return AllRoute.formatPool(pool, this.routeProviders);
    };

    listTokens = async () => {
        const routeData = await this.getTokenBiMap(this.provider);
        return routeData.tokenBiMap.toArray();
    }

    getTokenBiMap = async <T>(
        provider?: JsonRpcProvider
    ): Promise<TokenBiMap<T>> => {
        const cachedData = await this.cache.getDexTokenIndexBiMapCache(
            this.name,
            this.formatPool as (pool: any) => T
        );

        if (cachedData) {
            return cachedData;
        }

        const tokenBiMap = await this.getNewTokenBiMap<T[]>(
            provider || this.provider
        );

        this.cache.setDexTokenIndexBiMapCache(this.name, tokenBiMap);
        return tokenBiMap;
    };

    getNewTokenBiMap = async <T>(
        provider?: JsonRpcProvider
    ): Promise<{
        tokenBiMap: ArrayBiMap<string>;
        data: T;
        tokenPoolMap: Map<string, string>;
    }> => {
        const tokenBiMap = new ArrayBiMap<string>();
        const tokenPoolMap = new Map<string, string>();
        const data = new Map<string, any>();

        for (const RouteProviderClass of this.routeProviders) {
            const route = new RouteProviderClass(
                provider || this.provider,
                this.cache
            );

            const {
                tokenBiMap: routeTokenBiMap,
                tokenPoolMap: routeTokenPoolMap,
                data: routeData,
            } = await route.getTokenBiMap();

            // Merge token bi-maps
            routeTokenBiMap
                .toArray()
                .forEach((token) => tokenBiMap.setArrayValue(token.toLowerCase()));

            // Merge token pool maps with dex prefix
            routeTokenPoolMap.forEach((value, key) => {
                tokenPoolMap.set(`${key}:${route.name}`, value);
            });

            data.set(route.name as string, routeData);
        }

        return {
            data: [...data.entries()] as T,
            tokenBiMap,
            tokenPoolMap
        };
    };

    getGraph = async (
        provider?: JsonRpcProvider,
        _tokenBiMap?: TokenBiMap<any>,
        ignoreCache?: boolean
    ): Promise<Graph> => {
        if (!ignoreCache) {
            const cachedData = await this.cache.getDexGraphCache(this.name);
            if (cachedData) {
                return cachedData as Graph;
            }
        }

        let tokenBiMap;
        if (_tokenBiMap) {
            tokenBiMap = _tokenBiMap;
        } else {
            tokenBiMap = await this.getTokenBiMap<any>(provider);
        }

        const graph = await this.getNewGraph(
            tokenBiMap,
            provider || this.provider
        );

        this.cache.setDexGraphCache(this.name, graph);
        return graph;
    };

    getNewGraph = async (
        tokenBiMap?: TokenBiMap<any>,
        _provider?: JsonRpcProvider
    ) => {
        const provider = _provider || this.provider;

        let tokenIndexBiMap: ArrayBiMap<string>;
        let data: any[];

        if (tokenBiMap) {
            tokenIndexBiMap = tokenBiMap.tokenBiMap;
            data = tokenBiMap.data;
        } else {
            const { tokenBiMap: _tokenBiMap, data: _data } =
                await this.getTokenBiMap<any>(provider);
            data = _data;
            tokenIndexBiMap = _tokenBiMap;
        }

        const graph: Graph = Array.from({ length: tokenIndexBiMap.toArray().length }, () => []);

        console.log("Building aggregated graph with", data.length, "DEXes");

        await Promise.all(
            data.map(async ([dexId, poolData]) => {
                const RouteProviderClass = this.getRouteProviderByDexId(dexId);
                const route = new RouteProviderClass(provider, this.cache);

                const routeTokenBiMap = await route.getTokenBiMap<any>();
                const routeGraph = await route.getGraph(
                    provider,
                    routeTokenBiMap,
                    true
                );

                poolData.forEach((pool: any) => {
                    const { tokenX, tokenY } = route.getTokenXAndYFromPool(pool);

                    const tokenA = tokenX.toLowerCase();
                    const tokenB = tokenY.toLowerCase();

                    const fromTokenIndex = routeTokenBiMap.tokenBiMap.getByValue(tokenA);
                    const toTokenIndex = routeTokenBiMap.tokenBiMap.getByValue(tokenB);

                    if (fromTokenIndex === undefined || toTokenIndex === undefined) {
                        return;
                    }

                    const dexDirectEdge = routeGraph[fromTokenIndex]?.find(
                        (r) => r.from === fromTokenIndex && r.to === toTokenIndex
                    );

                    const dexReverseEdge = routeGraph[toTokenIndex]?.find(
                        (r) => r.from === toTokenIndex && r.to === fromTokenIndex
                    );

                    if (!dexDirectEdge || !dexReverseEdge) {
                        return;
                    }

                    const fromTokenIndexInAllGraph = tokenIndexBiMap.getByValue(tokenA);
                    const toTokenIndexInAllGraph = tokenIndexBiMap.getByValue(tokenB);

                    if (fromTokenIndexInAllGraph === undefined || toTokenIndexInAllGraph === undefined) {
                        return;
                    }

                    const directEdge = new Edge(
                        fromTokenIndexInAllGraph,
                        toTokenIndexInAllGraph,
                        dexDirectEdge.edgeData
                    );

                    const reverseEdge = new Edge(
                        toTokenIndexInAllGraph,
                        fromTokenIndexInAllGraph,
                        dexReverseEdge.edgeData
                    );

                    graph[fromTokenIndexInAllGraph].push(directEdge);
                    graph[toTokenIndexInAllGraph].push(reverseEdge);
                });
            })
        );

        console.log("Aggregated graph construction complete");
        return graph;
    };

    getFunctionToMutateEdgeCost = () => {
        const func: FunctionToMutateTheEdgeCostType<any> = (params, e) => {
            const RouteProviderClass = this.getRouteProviderByDexId(params.dexId);
            const routeProvider = new RouteProviderClass(this.provider, this.cache);

            const functionToMutateEdge = routeProvider.getFunctionToMutateEdgeCost();
            return functionToMutateEdge(params, e);
        };
        return func;
    };

    getTransactionInstructionFromRoutePlan = async (
        amountFormattedToTokenDecimal: Decimal,
        routePlan: DeserializeRoutePlan<DexIdTypes>[],
        wallet: string,
        slippage: number,
        isNativeIn: boolean,
        isNativeOut: boolean,
        partnerFees?: { recipient: string; fee: number }
    ) => {
        let currentAmountIn = new Decimal(amountFormattedToTokenDecimal);
        const allTransactions: any[] = [];

        for (let i = 0; i < routePlan.length; i++) {
            const plan = routePlan[i];

            const RouteProviderClass = this.getRouteProviderByDexId(plan.dexId as string);
            const route = new RouteProviderClass(this.provider, this.cache);

            const transaction = await route.getTransactionInstructionFromRoutePlan(
                currentAmountIn,
                [plan],
                wallet,
                slippage,
                i === 0 ? isNativeIn : false,
                i === routePlan.length - 1 ? isNativeOut : false,
                i === 0 ? partnerFees : undefined
            );

            allTransactions.push(transaction);

            const { amountOut } = await route.getAmountOutFromPlan(
                currentAmountIn,
                [plan],
                0,
                this.provider
            );
            currentAmountIn = amountOut;
        }

        return { transactions: allTransactions };
    };

    getAmountOutFromPlan = async (
        amountFormattedToTokenDecimal: Decimal,
        routePlan: DeserializeRoutePlan<DexIdTypes>[],
        devFeeRate: number,
        provider?: JsonRpcProvider
    ) => {
        let currentAmountIn = new Decimal(amountFormattedToTokenDecimal);

        for (const plan of routePlan) {
            const RouteProviderClass = this.getRouteProviderByDexId(plan.dexId as string);
            const route = new RouteProviderClass(provider || this.provider, this.cache);

            const { amountOut } = await route.getAmountOutFromPlan(
                currentAmountIn,
                [plan],
                devFeeRate,
                provider
            );

            currentAmountIn = amountOut;
        }

        return { amountOut: currentAmountIn };
    };

    getTokenPairEdgeData = async (tokenA: string, tokenB: string) => {
        const routeData = await this.getTokenBiMap(this.provider);
        const tokenAIndex = routeData.tokenBiMap.getByValue(tokenA.toLowerCase());
        const tokenBIndex = routeData.tokenBiMap.getByValue(tokenB.toLowerCase());

        if (tokenAIndex === undefined || tokenBIndex === undefined) {
            throw new Error("DEX_ERRORS.PAIR_NOT_AVAILABLE_ON_DEX");
        }

        const graph = await this.getGraph();
        const edges = graph[tokenAIndex];
        const edgeData = edges.find((e) => e.to === tokenBIndex);

        return edgeData || null;
    };

    calculateRoutePrice = async (
        route: DeserializeRoutePlan<DexIdTypes>[]
    ): Promise<number> => {
        let finalPrice = 1;

        for (const segment of route) {
            const edgeData = await this.getTokenPairEdgeData(
                segment.tokenA,
                segment.tokenB
            );

            if (!edgeData) {
                throw new Error(
                    `Price not available for token pair ${segment.tokenA} - ${segment.tokenB}`
                );
            }

            finalPrice *= edgeData.edgeData.price;
        }

        return finalPrice;
    };

    getTokenXAndYFromPool = (pool: any) => {
        throw new Error(
            "This method should only be called by individual route providers"
        );
    };

    getDexConfig = () => {
        console.warn("dexConfig is ment for individual route providers, not the aggregator, please work on this, this will just return the first route provider config");
        return new this.routeProviders[0](this.provider, this.cache).getDexConfig();
    };

    getSurePriceOfToken = async (tokenAddress: string) => {
        let price = await this.cache.getPriceFromCache(tokenAddress);

        if (price !== null) {
            return price;
        }
        // TODO: NOT SURE IF I SHOULD AVERAGE OR TAKE FIRST NON NULL / HIGHEST PRICE
        let aggregatedPrice = 0;
        let count = 0;

        for (const RouteProviderClass of this.routeProviders) {
            const route = new RouteProviderClass(this.provider, this.cache);
            const routePrice = await route.getSurePriceOfToken(tokenAddress);

            if (routePrice !== null && routePrice > 0) {
                aggregatedPrice += routePrice;
                count++;
            }
        }

        if (count === 0) {
            return null; // Price not found in any DEX
        }

        price = aggregatedPrice / count;
        await this.cache.setPriceToCache(tokenAddress, price);
        return price;
    };
}
