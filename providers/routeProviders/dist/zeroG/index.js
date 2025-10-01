"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionFromRoutePlanZeroG = exports.getTransactionInstructionFromRoutePlanZeroG = exports.ZeroGRoute = void 0;
const UniswapV3Calculator_1 = require("../UniswapV3Calculator");
const decimal_js_1 = __importDefault(require("decimal.js"));
const graph_1 = require("@deserialize-evm-agg/graph");
const swap_contract_sdk_1 = require("@deserialize-evm-agg/swap-contract-sdk");
const utils_1 = require("../utils");
const abi_1 = require("./abi");
// export class ZeroGTestnetRoute<DexIdTypes> implements IRoute<PoolData, DexIdTypes> {
//     name = "ZERO_TESTNET_G" as DexIdTypes;
//     provider: JsonRpcProvider;
//     cache: DexCache<DexIdTypes>
//     dexConfig: DexConfig
//     calculator: UniswapV3QuoteCalculator
//     network: NetworkType = "0gTestnet"
//     static network: NetworkType = "0gTestnet"
//     static config: DexConfig = {
//         name: "Janie Testnet (formally Zero G)",
//         factoryAddress: "0x7453582657F056ce5CfcEeE9E31E4BC390fa2b3c",
//         quoterAddress: "0x8d5E064d2EF44C29eE349e71CF70F751ECD62892",
//         fromBlock: "171522",
//         stableTokenAddress: "0x3eC8A8705bE1D5ca90066b37ba62c4183B024ebf",
//         abi: ZeroGAbi,
//         //! TODO: CHANGE, THIS IS NOT THE REAL WRAPPED TOKEN ADDRESS, THIS IS FOR MAINNET
//         wrappedNativeTokenAddress: "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c",
//         nativeTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
//     }
//     constructor(provider: JsonRpcProvider, cache: DexCache<DexIdTypes>) {
//         this.provider = provider;
//         this.cache = cache
//         this.dexConfig = ZeroGRoute.config
//         this.calculator = new UniswapV3QuoteCalculator(ZeroGRoute.config, this.provider)
//     }
//     getDexConfig = () => {
//         return ZeroGRoute.config
//     };
//     getTransactionInstructionFromRoutePlan = async (
//         amountFormattedToTokenDecimal: Decimal,
//         routePlan: DeserializeRoutePlan<DexIdTypes>[],
//         wallet: string,
//         slippage: number,
//         isNativeIn: boolean,
//         isNativeOut: boolean,
//         partnerFees?: { recipient: string; fee: number }
//     ) => {
//         const { amountOut } = await this.getAmountOutFromPlan(amountFormattedToTokenDecimal, routePlan, 0, this.provider)
//         console.log('amountOut: ', amountOut);
//         //here we will get the transaction here
//         return await getTransactionFromRoutePlanZeroG(amountFormattedToTokenDecimal, amountOut, routePlan, wallet, slippage, this.provider, isNativeIn, isNativeOut, partnerFees)
//     };
//     getAmountOutFromPlan = async (
//         amountFormattedToTokenDecimal: Decimal,
//         routePlan: DeserializeRoutePlan<DexIdTypes>[],
//         devFeeRate: number,
//         provider?: JsonRpcProvider
//     ) => {
//         return await getTransactionInstructionFromRoutePlanZeroG(
//             amountFormattedToTokenDecimal,
//             routePlan,
//             provider || this.provider,
//         );
//     };
//     getEdgeDataReverse?: (<T extends PoolData, R extends EdgeData>(provider: JsonRpcProvider, data: T, r: boolean) => Promise<R | null>) | undefined;
//     formatPool = (pool: any) => {
//         return ZeroGRoute.formatPool(pool);
//     };
//     static formatPool = (pool: PoolData): PoolData => {
//         // console.log('pool: ', pool);
//         return {
//             token0: pool.token0,
//             token1: pool.token1,
//             poolAddress: pool.poolAddress,
//             slot0: pool.slot0,
//             sqrtPriceX96: pool.sqrtPriceX96,
//             fee: pool.fee,
//             liquidity: pool.liquidity,
//         };
//     };
//     getTokenBiMap = async <PoolData>(
//         provider?: JsonRpcProvider
//     ): Promise<TokenBiMap<PoolData>> => {
//         //TODO: NO MEMORY CACHE FOR NOW
//         const cachedData = await this.cache.getDexTokenIndexBiMapCache(
//             this.name,
//             this.formatPool
//         );
//         if (cachedData) {
//             return cachedData as TokenBiMap<PoolData>;
//         }
//         console.log("No cached data found, getting a new one...");
//         const tokenBiMap = await this.getNewTokenBiMap<PoolData>(
//             provider || this.provider
//         );
//         this.cache.setDexTokenIndexBiMapCache(this.name, tokenBiMap);
//         return tokenBiMap;
//     }
//     getNewTokenBiMap = async <T>(
//         provider: JsonRpcProvider
//     ): Promise<{
//         tokenBiMap: ArrayBiMap<string>;
//         data: T[];
//         tokenPoolMap: Map<string, string>;
//     }> => {
//         // Fetch token data
//         const data = await this.calculator.getAllPools(this.dexConfig.abi)
//         // console.log('data: ', data);
//         const tokenBiMap = new ArrayBiMap<string>();
//         const tokenPoolMap = new Map<string, string>();
//         // Add tokens from the pool data
//         data.forEach((pool: PoolData) => {
//             const { token0, token1, poolAddress, fee } = pool;
//             tokenBiMap.setArrayValue(token0.address.toLowerCase());
//             tokenBiMap.setArrayValue(token1.address.toLowerCase());
//             tokenPoolMap.set(
//                 `${token0.address.toLowerCase()}:${fee}:${token1.address.toLowerCase()}`,
//                 poolAddress);
//             // }
//         });
//         return { data: data as T[], tokenBiMap, tokenPoolMap };
//     };
//     getGraph = async (
//         provider?: JsonRpcProvider,
//         _tokenBiMap?: TokenBiMap<PoolData>,
//         ignoreCache?: boolean
//     ): Promise<Graph> => {
//         //TODO: NO MEMORY CACHE FOR NOW
//         if (!ignoreCache) {
//             const cachedData = await this.cache.getDexGraphCache(this.name);
//             if (cachedData) {
//                 // console.log("Cache Exit....");
//                 // if (!checkIfGraphIsEmpty(cachedData)) { //TODO: NO CHECK FOR NOW
//                 return cachedData as Graph;
//                 // }
//                 console.log("Cached graph is  empty");
//             }
//         }
//         let tokenBiMap;
//         if (_tokenBiMap) {
//             tokenBiMap = _tokenBiMap;
//         } else {
//             tokenBiMap = await this.getTokenBiMap<PoolData>(provider);
//         }
//         const graph = await this.getNewGraph(
//             tokenBiMap,
//             provider || this.provider
//         );
//         this.cache.setDexGraphCache(this.name, graph);
//         return graph;
//     };
//     getNewGraph = async (
//         tokenBiMap?: TokenBiMap<PoolData>,
//         _provider?: JsonRpcProvider
//     ) => {
//         const provider = _provider || this.provider;
//         let tokenIndexBiMap;
//         let data;
//         if (tokenBiMap) {
//             tokenIndexBiMap = tokenBiMap.tokenBiMap;
//             data = tokenBiMap.data;
//         } else {
//             const { tokenBiMap, data: _data } =
//                 await this.getTokenBiMap<PoolData>(provider);
//             data = _data;
//             tokenIndexBiMap = tokenBiMap;
//         }
//         // Initialize graph
//         // console.log('data: ', data);
//         const graph: Graph = Array.from({ length: data.length }, () => []);
//         // Set the concurrency limit (number of pools processed concurrently)
//         const CONCURRENCY_LIMIT = 1;
//         // Helper: process one pool
//         const processPool = async (wp: PoolData) => {
//             const fromTokenString = wp.token0.address.toLowerCase()
//             const fromTokenIndex = tokenIndexBiMap.getByValue(fromTokenString);
//             const toTokenString = wp.token1.address.toLowerCase()
//             const toTokenIndex = tokenIndexBiMap.getByValue(toTokenString);
//             if (fromTokenIndex === undefined || toTokenIndex === undefined) {
//                 return;
//             }
//             try {
//                 const directData = await this.getEdgeDataDirect<
//                     PoolData,
//                     SwapQuoteParamWithEdgeData<PoolData>
//                 >(provider, wp, false).catch((err: any) => {
//                     console.error(
//                         `Error fetching direct data for ${wp.token0.address}:${wp.token1.address}:`,
//                         err
//                     );
//                     return null;
//                 });
//                 const reverseData = await this.getEdgeDataDirect<
//                     PoolData,
//                     SwapQuoteParamWithEdgeData<PoolData>
//                 >(provider, wp, true).catch((err) => {
//                     console.error(
//                         `Error fetching reverse data for ${wp.token1.address}:${wp.token0.address}:`,
//                         err
//                     );
//                     return null;
//                 });
//                 if (!directData || !reverseData) {
//                     console.warn(
//                         `Skipping pool ${wp.token1.address}:${wp.token0.address} due to incomplete data`
//                     );
//                     return;
//                 }
//                 const directEdge = new Edge<SwapQuoteParamWithEdgeDataString>(
//                     Number(fromTokenIndex),
//                     Number(toTokenIndex),
//                     {
//                         price: directData.price,
//                         fee: directData.fee,
//                         priceUsdc: directData.priceUsdc,
//                         tokenFromReserve: directData.tokenFromReserve,
//                         tokenToReserve: directData.tokenToReserve,
//                         tokenFromDecimals: directData.tokenFromDecimals,
//                         tokenToDecimals: directData.tokenToDecimals,
//                         pool: directData.pool,
//                         aToB: directData.aToB,
//                         dexId: directData.dexId,
//                         poolAddress: directData.poolAddress,
//                     }
//                 );
//                 const reverseEdge = new Edge(
//                     Number(toTokenIndex),
//                     Number(fromTokenIndex),
//                     {
//                         price: reverseData.price,
//                         priceUsdc: reverseData.priceUsdc,
//                         tokenFromReserve: reverseData.tokenToReserve,
//                         tokenToReserve: reverseData.tokenFromReserve,
//                         tokenFromDecimals: directData.tokenToDecimals,
//                         tokenToDecimals: directData.tokenFromDecimals,
//                         pool: directData.pool,
//                         fee: reverseData.fee,
//                         poolAddress: reverseData.poolAddress,
//                         aToB: reverseData.aToB,
//                         dexId: directData.dexId,
//                     }
//                 );
//                 // Append edges to the graph
//                 graph[Number(fromTokenIndex)].push(directEdge);
//                 graph[Number(toTokenIndex)].push(reverseEdge);
//             } catch (error) {
//                 console.error("Error processing pool:", error);
//                 return;
//             }
//         };
//         let count = 0;
//         // Process the pools in chunks to limit concurrent requests.
//         for (let i = 0; i < data.length; i += CONCURRENCY_LIMIT) {
//             const chunk = data.slice(i, i + CONCURRENCY_LIMIT);
//             await Promise.all(chunk.map((wp) => processPool(wp)));
//             console.log("count: ", count++);
//         }
//         return graph;
//     };
//     getEdgeDataDirect = async <T extends PoolData, R>(
//         provider: JsonRpcProvider,
//         data: T,
//         r: boolean
//     ): Promise<R | null> => {
//         const priceUsdc = await this.calculator.getSureTokenPrice(
//             data.token0.address,
//         );
//         console.log('priceUsdc: ', priceUsdc);
//         const rPriceUsdc = await this.calculator.getSureTokenPrice(
//             data.token1.address,
//         );
//         const price = this.calculator.calculateSpotPrice(
//             new Decimal(data.sqrtPriceX96),
//             data.token0.decimals,
//             data.token1.decimals,
//             !r
//         );
//         console.log('price: ', price);
//         const res: SwapQuoteParamWithEdgeData<PoolData> = {
//             price,
//             priceUsdc: r ? rPriceUsdc : priceUsdc,
//             tokenFromDecimals: r ? data.token1.decimals : data.token0.decimals,
//             tokenToDecimals: r ? data.token0.decimals : data.token1.decimals,
//             dexId: this.name,
//             aToB: !r,
//             poolAddress: data.poolAddress,
//             fee: data.fee,
//             pool: {
//                 liquidity: data.liquidity.toString(),
//                 fee: data.fee,
//                 sqrtPriceX96: data.sqrtPriceX96,
//                 token0: data.token0,
//                 token1: data.token1,
//                 poolAddress: data.poolAddress,
//                 slot0: data.slot0,
//             }
//         }
//         return res as R | null
//     };
//     getFunctionToMutateEdgeCost = () => {
//         //?i should find a way to properly type the below generic instead of using "any"
//         let func: FunctionToMutateTheEdgeCostType<any>;
//         func = (params, e) => {
//             // console.log('params: ', params);
//             let swapAmount = (params.key.key * params.key.keyRate) / params.priceUsdc;
//             // console.log('params.priceUsdc: ', e.edgeData.priceUsdc);
//             // console.log('params.priceUsdc: ', e.edgeData.aToB);
//             // console.log('key : ', params.key.key, 'keyRate: ', params.key.keyRate, "dollar value :", (params.key.key * params.key.keyRate), 'params.priceUsdc: ', params.priceUsdc, 'swapAmount: ', swapAmount);
//             //divide it by the decimal of the key and then multiply by the current token input decimal
//             swapAmount = swapAmount / Math.pow(10, Math.abs(params.key.keyDecimal));
//             swapAmount =
//                 swapAmount * Math.pow(10, Math.abs(params.tokenFromDecimals));
//             // console.log('swapAmount: ', swapAmount);
//             // console.log('e.edgeData.pool: ', e.edgeData.pool);
//             // console.log('e: ', e);
//             const swapParams: ZeroDexQuoteParams = {
//                 pool: this.formatPool(typeof e.edgeData.pool === "string" ? JSON.parse(e.edgeData.pool) : e.edgeData.pool),
//                 aToB: e.edgeData.aToB,
//                 amountInFormattedInDecimal: new Decimal(swapAmount),
//             };
//             // swapParams.ticks;
//             // console.log("swap direction : ", swapParams.aToB ? swapParams.pool.token0.symbol : swapParams.pool.token1.symbol, " => ", swapParams.aToB ? swapParams.pool.token1.symbol : swapParams.pool.token0.symbol, "aToB : ", swapParams.aToB, "fee: ", swapParams.pool.fee);
//             const res = this.calculator.getAmountOut(swapParams);
//             // console.log('swapParams: ', swapParams);
//             // console.log('res: ', res);
//             if (!res) {
//                 return 100;
//             }
//             const amountOut = res.amountOut;
//             if (amountOut.lt(new Decimal(0))) {
//                 return 100;
//             }
//             const amountIn =
//                 new Decimal(swapAmount)
//             const amountBOut = amountOut
//             let amountOutInTokenA = amountBOut.div(params.price)
//             // Calculate swap impact
//             const _swapImpact = (((amountIn.sub(amountOutInTokenA)).div(amountIn)).mul(100)).toNumber()
//             if (isNaN(_swapImpact)) {
//                 // console.warn("Swap impact is NaN, returning 100");
//                 return 100;
//             }
//             // console.log(
//             //     "_swapImpact: ", _swapImpact,
//             //     "from", e?.from,
//             //     "to", e?.to,
//             //     "from decimals", params.tokenFromDecimals,
//             //     "to decimals", params.tokenToDecimals,
//             // );
//             // console.log(
//             //     "amountBOut: =>", amountBOut.toNumber() / 10 ** 18,
//             //     "params.price: ", params.price,
//             //     "amountIn", amountIn.toNumber() / 10 ** 18,
//             //     "amountOutInTokenA: ", amountOutInTokenA.toNumber() / 10 ** 18,
//             // );
//             // console.log("======================================")
//             return Math.max(0, _swapImpact);
//         };
//         return func;
//     };
//     getTokenPairEdgeData = async (tokenA: string, tokenB: string) => {
//         const routeData = await this.getTokenBiMap(this.provider);
//         const tokenAIndex = routeData.tokenBiMap.getByValue(tokenA);
//         // console.log("tokenAIndex: ", tokenAIndex);
//         const tokenBIndex = routeData.tokenBiMap.getByValue(tokenB);
//         // console.log("tokenBIndex: ", tokenBIndex);
//         if (tokenAIndex === undefined || tokenBIndex === undefined) {
//             throw new Error("DEX_ERRORS.PAIR_NOT_AVAILABLE_ON_DEX");
//         }
//         const graph = await this.getGraph();
//         const edges = graph[tokenAIndex];
//         const edgeData = edges.find((e) => e.to === tokenBIndex);
//         if (!edgeData) {
//             return null;
//         }
//         return edgeData;
//     };
//     calculateRoutePrice = async (
//         route: DeserializeRoutePlan<DexIdTypes>[]
//     ): Promise<number> => {
//         let finalPrice = 1;
//         // Iterate over each segment in the route.
//         for (const segment of route) {
//             try {
//                 // Try to get the price from the edge data between the tokens.
//                 // This function may throw if no edge exists.
//                 const edgeData = await this.getTokenPairEdgeData(
//                     (segment.tokenA),
//                     (segment.tokenB)
//                 );
//                 if (!edgeData) {
//                     throw new Error(
//                         `Price not available for token pair ${segment.tokenA} - ${segment.tokenB}`
//                     );
//                 }
//                 // Assume that edgeData contains a 'price' field.
//                 finalPrice *= edgeData.edgeData.price;
//             } catch (error) {
//                 // If the edge data isn't available, fall back to using a price provided on the segment.
//                 throw new Error(
//                     `Price not available for token pair ${segment.tokenA} - ${segment.tokenB}`
//                 );
//             }
//         }
//         return finalPrice;
//     };
//     listTokens = async () => {
//         const routeData = await this.getTokenBiMap(this.provider);
//         return routeData.tokenBiMap.toArray();
//     }
//     getTokenXAndYFromPool = (pool: PoolData) => {
//         const { token0, token1 } = pool;
//         return {
//             tokenX: token0.address,
//             tokenY: token1.address,
//         };
//     };
// }
class ZeroGRoute {
    constructor(provider, cache) {
        this.name = "ZERO_G";
        this.network = "0gMainnet";
        this.getDexConfig = () => {
            return ZeroGRoute.config;
        };
        this.getTransactionInstructionFromRoutePlan = async (amountFormattedToTokenDecimal, routePlan, wallet, slippage, isNativeIn, isNativeOut, partnerFees) => {
            const { amountOut } = await this.getAmountOutFromPlan(amountFormattedToTokenDecimal, routePlan, 0, this.provider);
            //here we will get the transaction here
            return await (0, exports.getTransactionFromRoutePlanZeroG)(amountFormattedToTokenDecimal, amountOut, routePlan, wallet, slippage, this.provider, isNativeIn, isNativeOut, partnerFees);
        };
        this.getAmountOutFromPlan = async (amountFormattedToTokenDecimal, routePlan, devFeeRate, provider) => {
            return await (0, exports.getTransactionInstructionFromRoutePlanZeroG)(amountFormattedToTokenDecimal, routePlan, provider || this.provider);
        };
        this.formatPool = (pool) => {
            return ZeroGRoute.formatPool(pool);
        };
        this.getTokenBiMap = async (provider) => {
            //TODO: NO MEMORY CACHE FOR NOW
            const cachedData = await this.cache.getDexTokenIndexBiMapCache(this.name, this.formatPool);
            if (cachedData) {
                return cachedData;
            }
            console.log("No cached data found, getting a new one...");
            const tokenBiMap = await this.getNewTokenBiMap(provider || this.provider);
            this.cache.setDexTokenIndexBiMapCache(this.name, tokenBiMap);
            return tokenBiMap;
        };
        this.getNewTokenBiMap = async (provider) => {
            // Fetch token data
            const data = await this.calculator.getAllPools(this.dexConfig.abi);
            // console.log('data: ', data);
            const tokenBiMap = new graph_1.ArrayBiMap();
            const tokenPoolMap = new Map();
            // Add tokens from the pool data
            data.forEach((pool) => {
                const { token0, token1, poolAddress, fee } = pool;
                tokenBiMap.setArrayValue(token0.address.toLowerCase());
                tokenBiMap.setArrayValue(token1.address.toLowerCase());
                tokenPoolMap.set(`${token0.address.toLowerCase()}:${fee}:${token1.address.toLowerCase()}`, poolAddress);
                // }
            });
            return { data: data, tokenBiMap, tokenPoolMap };
        };
        this.listTokens = async () => {
            const routeData = await this.getTokenBiMap(this.provider);
            return routeData.tokenBiMap.toArray();
        };
        this.getGraph = async (provider, _tokenBiMap, ignoreCache) => {
            //TODO: NO MEMORY CACHE FOR NOW
            if (!ignoreCache) {
                const cachedData = await this.cache.getDexGraphCache(this.name);
                if (cachedData) {
                    // console.log("Cache Exit....");
                    // if (!checkIfGraphIsEmpty(cachedData)) { //TODO: NO CHECK FOR NOW
                    return cachedData;
                    // }
                    console.log("Cached graph is  empty");
                }
            }
            let tokenBiMap;
            if (_tokenBiMap) {
                tokenBiMap = _tokenBiMap;
            }
            else {
                tokenBiMap = await this.getTokenBiMap(provider);
            }
            const graph = await this.getNewGraph(tokenBiMap, provider || this.provider);
            this.cache.setDexGraphCache(this.name, graph);
            return graph;
        };
        this.getNewGraph = async (tokenBiMap, _provider) => {
            const provider = _provider || this.provider;
            let tokenIndexBiMap;
            let data;
            if (tokenBiMap) {
                tokenIndexBiMap = tokenBiMap.tokenBiMap;
                data = tokenBiMap.data;
            }
            else {
                const { tokenBiMap, data: _data } = await this.getTokenBiMap(provider);
                data = _data;
                if (tokenBiMap instanceof graph_1.ArrayBiMap) {
                    console.log("Using existing ArrayBiMap.....");
                    tokenIndexBiMap = tokenBiMap;
                }
                else if (typeof tokenBiMap === "object" && !Array.isArray(tokenBiMap)) {
                    console.log("Converting tokenBiMap to ArrayBiMap");
                    tokenIndexBiMap = new graph_1.ArrayBiMap(tokenBiMap);
                }
                else {
                    throw new Error("Invalid tokenBiMap type");
                }
            }
            // Initialize graph
            // console.log('data: ', data);
            const graph = Array.from({ length: data.length }, () => []);
            // Set the concurrency limit (number of pools processed concurrently)
            const CONCURRENCY_LIMIT = 1;
            // Helper: process one pool
            console.log('tokenIndexBiMap: ', tokenIndexBiMap);
            tokenIndexBiMap = Array.isArray(tokenIndexBiMap) ? new graph_1.ArrayBiMap(tokenIndexBiMap) : tokenIndexBiMap;
            const processPool = async (wp) => {
                console.log('wp: ', wp.token0.address, wp.token1.address, wp.poolAddress);
                const fromTokenString = wp.token0.address.toLowerCase();
                const fromTokenIndex = tokenIndexBiMap.getByValue(fromTokenString);
                const toTokenString = wp.token1.address.toLowerCase();
                const toTokenIndex = tokenIndexBiMap.getByValue(toTokenString);
                if (fromTokenIndex === undefined || toTokenIndex === undefined) {
                    return;
                }
                try {
                    const directData = await this.getEdgeDataDirect(provider, wp, false).catch((err) => {
                        console.error(`Error fetching direct data for ${wp.token0.address}:${wp.token1.address}:`, err);
                        return null;
                    });
                    const reverseData = await this.getEdgeDataDirect(provider, wp, true).catch((err) => {
                        console.error(`Error fetching reverse data for ${wp.token1.address}:${wp.token0.address}:`, err);
                        return null;
                    });
                    if (!directData || !reverseData) {
                        console.warn(`Skipping pool ${wp.token1.address}:${wp.token0.address} due to incomplete data`);
                        return;
                    }
                    const directEdge = new graph_1.Edge(Number(fromTokenIndex), Number(toTokenIndex), {
                        price: directData.price,
                        fee: directData.fee,
                        priceUsdc: directData.priceUsdc,
                        tokenFromReserve: directData.tokenFromReserve,
                        tokenToReserve: directData.tokenToReserve,
                        tokenFromDecimals: directData.tokenFromDecimals,
                        tokenToDecimals: directData.tokenToDecimals,
                        pool: directData.pool,
                        aToB: directData.aToB,
                        dexId: directData.dexId,
                        poolAddress: directData.poolAddress,
                    });
                    const reverseEdge = new graph_1.Edge(Number(toTokenIndex), Number(fromTokenIndex), {
                        price: reverseData.price,
                        priceUsdc: reverseData.priceUsdc,
                        tokenFromReserve: reverseData.tokenToReserve,
                        tokenToReserve: reverseData.tokenFromReserve,
                        tokenFromDecimals: directData.tokenToDecimals,
                        tokenToDecimals: directData.tokenFromDecimals,
                        pool: directData.pool,
                        fee: reverseData.fee,
                        poolAddress: reverseData.poolAddress,
                        aToB: reverseData.aToB,
                        dexId: directData.dexId,
                    });
                    // Append edges to the graph
                    graph[Number(fromTokenIndex)].push(directEdge);
                    graph[Number(toTokenIndex)].push(reverseEdge);
                }
                catch (error) {
                    console.error("Error processing pool:", wp, error);
                    return;
                }
            };
            let count = 0;
            // Process the pools in chunks to limit concurrent requests.
            for (let i = 0; i < data.length; i += CONCURRENCY_LIMIT) {
                const chunk = data.slice(i, i + CONCURRENCY_LIMIT);
                await Promise.all(chunk.map((wp) => processPool(wp)));
                console.log("count: ", count++);
            }
            return graph;
        };
        this.getEdgeDataDirect = async (provider, data, r) => {
            const priceUsdc = await this.calculator.getSureTokenPrice(data.token0.address);
            console.log('priceUsdc: ', priceUsdc);
            const rPriceUsdc = await this.calculator.getSureTokenPrice(data.token1.address);
            const price = this.calculator.calculateSpotPrice(new decimal_js_1.default(data.sqrtPriceX96), data.token0.decimals, data.token1.decimals, !r);
            console.log('price: ', price);
            const res = {
                price,
                priceUsdc: r ? rPriceUsdc : priceUsdc,
                tokenFromDecimals: r ? data.token1.decimals : data.token0.decimals,
                tokenToDecimals: r ? data.token0.decimals : data.token1.decimals,
                dexId: this.name,
                aToB: !r,
                poolAddress: data.poolAddress,
                fee: data.fee,
                pool: {
                    liquidity: data.liquidity.toString(),
                    fee: data.fee,
                    sqrtPriceX96: data.sqrtPriceX96,
                    token0: data.token0,
                    token1: data.token1,
                    poolAddress: data.poolAddress,
                    slot0: data.slot0,
                }
            };
            return res;
        };
        this.getFunctionToMutateEdgeCost = () => {
            //?i should find a way to properly type the below generic instead of using "any"
            let func;
            func = (params, e) => {
                // console.log('params: ', params);
                let swapAmount = (params.key.key * params.key.keyRate) / params.priceUsdc;
                // console.log('params.priceUsdc: ', e.edgeData.priceUsdc);
                // console.log('params.priceUsdc: ', e.edgeData.aToB);
                // console.log('key : ', params.key.key, 'keyRate: ', params.key.keyRate, "dollar value :", (params.key.key * params.key.keyRate), 'params.priceUsdc: ', params.priceUsdc, 'swapAmount: ', swapAmount);
                //divide it by the decimal of the key and then multiply by the current token input decimal
                swapAmount = swapAmount / Math.pow(10, Math.abs(params.key.keyDecimal));
                swapAmount =
                    swapAmount * Math.pow(10, Math.abs(params.tokenFromDecimals));
                // console.log('swapAmount: ', swapAmount);
                // console.log('e.edgeData.pool: ', e.edgeData.pool);
                // console.log('e: ', e);
                const swapParams = {
                    pool: this.formatPool(typeof e.edgeData.pool === "string" ? JSON.parse(e.edgeData.pool) : e.edgeData.pool),
                    aToB: e.edgeData.aToB,
                    amountInFormattedInDecimal: new decimal_js_1.default(swapAmount),
                };
                // swapParams.ticks;
                // console.log("swap direction : ", swapParams.aToB ? swapParams.pool.token0.symbol : swapParams.pool.token1.symbol, " => ", swapParams.aToB ? swapParams.pool.token1.symbol : swapParams.pool.token0.symbol, "aToB : ", swapParams.aToB, "fee: ", swapParams.pool.fee);
                const res = this.calculator.getAmountOut(swapParams);
                // console.log('swapParams: ', swapParams);
                // console.log('res: ', res);
                if (!res) {
                    return 100;
                }
                const amountOut = res.amountOut;
                if (amountOut.lt(new decimal_js_1.default(0))) {
                    return 100;
                }
                const amountIn = new decimal_js_1.default(swapAmount);
                const amountBOut = amountOut;
                let amountOutInTokenA = amountBOut.div(params.price);
                // Calculate swap impact
                const _swapImpact = (((amountIn.sub(amountOutInTokenA)).div(amountIn)).mul(100)).toNumber();
                if (isNaN(_swapImpact)) {
                    // console.warn("Swap impact is NaN, returning 100");
                    return 100;
                }
                // console.log(
                //     "_swapImpact: ", _swapImpact,
                //     "from", e?.from,
                //     "to", e?.to,
                //     "from decimals", params.tokenFromDecimals,
                //     "to decimals", params.tokenToDecimals,
                // );
                // console.log(
                //     "amountBOut: =>", amountBOut.toNumber() / 10 ** 18,
                //     "params.price: ", params.price,
                //     "amountIn", amountIn.toNumber() / 10 ** 18,
                //     "amountOutInTokenA: ", amountOutInTokenA.toNumber() / 10 ** 18,
                // );
                // console.log("======================================")
                return Math.max(0, _swapImpact);
            };
            return func;
        };
        this.getTokenPairEdgeData = async (tokenA, tokenB) => {
            const routeData = await this.getTokenBiMap(this.provider);
            const tokenAIndex = routeData.tokenBiMap.getByValue(tokenA);
            // console.log("tokenAIndex: ", tokenAIndex);
            const tokenBIndex = routeData.tokenBiMap.getByValue(tokenB);
            // console.log("tokenBIndex: ", tokenBIndex);
            if (tokenAIndex === undefined || tokenBIndex === undefined) {
                throw new Error("DEX_ERRORS.PAIR_NOT_AVAILABLE_ON_DEX");
            }
            const graph = await this.getGraph();
            const edges = graph[tokenAIndex];
            const edgeData = edges.find((e) => e.to === tokenBIndex);
            if (!edgeData) {
                return null;
            }
            return edgeData;
        };
        this.calculateRoutePrice = async (route) => {
            let finalPrice = 1;
            // Iterate over each segment in the route.
            for (const segment of route) {
                try {
                    // Try to get the price from the edge data between the tokens.
                    // This function may throw if no edge exists.
                    const edgeData = await this.getTokenPairEdgeData((segment.tokenA), (segment.tokenB));
                    if (!edgeData) {
                        throw new Error(`Price not available for token pair ${segment.tokenA} - ${segment.tokenB}`);
                    }
                    // Assume that edgeData contains a 'price' field.
                    finalPrice *= edgeData.edgeData.price;
                }
                catch (error) {
                    // If the edge data isn't available, fall back to using a price provided on the segment.
                    throw new Error(`Price not available for token pair ${segment.tokenA} - ${segment.tokenB}`);
                }
            }
            return finalPrice;
        };
        this.getTokenXAndYFromPool = (pool) => {
            const { token0, token1 } = pool;
            return {
                tokenX: token0.address,
                tokenY: token1.address,
            };
        };
        this.provider = provider;
        this.cache = cache;
        this.dexConfig = ZeroGRoute.config;
        this.calculator = new UniswapV3Calculator_1.UniswapV3QuoteCalculator(ZeroGRoute.config, this.provider);
    }
}
exports.ZeroGRoute = ZeroGRoute;
ZeroGRoute.network = "0gMainnet";
ZeroGRoute.config = {
    name: "Janie (formally Zero G)",
    factoryAddress: "0x9bdcA5798E52e592A08e3b34d3F18EeF76Af7ef4",
    quoterAddress: "0xd00883722cECAD3A1c60bCA611f09e1851a0bE02",
    fromBlock: "0",
    //! TODO: THIS IS NOT THE STABLE COIN ADDRESS ON MAINNET
    stableTokenAddress: "0x1f3aa82227281ca364bfb3d253b0f1af1da6473e",
    abi: abi_1.ZeroGAbi,
    wrappedNativeTokenAddress: "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c",
    nativeTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
};
ZeroGRoute.formatPool = (pool) => {
    // console.log('pool: ', pool);
    return {
        token0: pool.token0,
        token1: pool.token1,
        poolAddress: pool.poolAddress,
        slot0: pool.slot0,
        sqrtPriceX96: pool.sqrtPriceX96,
        fee: pool.fee,
        liquidity: pool.liquidity,
    };
};
// export const getMoreDataForPool = async <T extends PoolData>(
//     provider: JsonRpcProvider,
//     params: T,
//     r: boolean
// ): Promise<SwapQuoteParamWithEdgeData<PoolData>> => {
//     //get other data for the pool here 
//     const calculator = new UniswapV3QuoteCalculator()
//     const priceUsdc = await getSureTokenPrice(
//         params.token0.address,
//     );
//     console.log('priceUsdc: ', priceUsdc);
//     const rPriceUsdc = await getSureTokenPrice(
//         params.token1.address,
//     );
//     console.log('rPriceUsdc: ', rPriceUsdc);
//     const price = calculateSpotPrice(
//         new Decimal(params.sqrtPriceX96),
//         params.token0.decimals,
//         params.token1.decimals,
//         !r
//     );
//     console.log('price: ', price);
//     const data: SwapQuoteParamWithEdgeData<PoolData> = {
//         price,
//         priceUsdc: r ? rPriceUsdc : priceUsdc,
//         tokenFromDecimals: r ? params.token1.decimals : params.token0.decimals,
//         tokenToDecimals: r ? params.token0.decimals : params.token1.decimals,
//         dexId: ZeroGRoute.name,
//         aToB: !r,
//         poolAddress: params.poolAddress,
//         fee: params.fee,
//         pool: {
//             liquidity: params.liquidity.toString(),
//             fee: params.fee,
//             sqrtPriceX96: params.sqrtPriceX96,
//             token0: params.token0,
//             token1: params.token1,
//             poolAddress: params.poolAddress,
//             slot0: params.slot0,
//         }
//     }
//     return data
// }
const getTransactionInstructionFromRoutePlanZeroG = async (amountFormattedToTokenDecimal, routePlan, connection) => {
    routePlan.map((r) => {
        if (r.dexId !== "ZERO_G") {
            throw new Error("One or all of the passed route is not a ZERO_G route path");
        }
    });
    let currentAmountIn = new decimal_js_1.default(amountFormattedToTokenDecimal);
    for (let i = 0; i < routePlan.length; i++) {
        const route = routePlan[i];
        console.log("currentAmountIn: ", currentAmountIn);
        const calculator = new UniswapV3Calculator_1.UniswapV3QuoteCalculator(ZeroGRoute.config, connection);
        const amountOut = await calculator.simulateTransaction(route.tokenA, route.tokenB, currentAmountIn.toString(), route.fee);
        currentAmountIn = new decimal_js_1.default(amountOut);
    }
    return { amountOut: currentAmountIn };
};
exports.getTransactionInstructionFromRoutePlanZeroG = getTransactionInstructionFromRoutePlanZeroG;
const getTransactionFromRoutePlanZeroG = async (amountIn, amountOut, routePlan, wallet, slippage, connection, isNativeIn, isNativeOut, partnerFees) => {
    console.log('isNativeIn: ', isNativeIn);
    // console.log('routePlan: ', routePlan);
    const paths = (0, utils_1.transformRoutePlanToIPath)(ZeroGRoute.config.factoryAddress, routePlan, ZeroGRoute.config.nativeTokenAddress, ZeroGRoute.config.wrappedNativeTokenAddress, isNativeIn, isNativeOut);
    console.log('routePlan: ', routePlan);
    console.log('paths: ', paths);
    const slippageMultiplier = new decimal_js_1.default(1).minus(slippage / 100);
    const minAmountOut = amountOut.mul(slippageMultiplier);
    // console.log('minAmountOut: ', minAmountOut);
    // console.log('amountIn: ', amountIn);
    // console.log('amountIn.toFixed(0),: ', amountIn.toFixed(0),);
    // console.log('minAmountOut.toFixed(0): ', minAmountOut.toFixed(0));
    // console.log('paths: ', paths);
    const txs = await (0, swap_contract_sdk_1.createSwapTX)({
        path: paths,
        amountInRaw: amountIn.toFixed(0),
        minAmountOut: minAmountOut.toFixed(0),
    }, wallet, connection, ZeroGRoute.network, partnerFees ? partnerFees : undefined);
    const transactions = txs.map((tx) => ({
        from: wallet,
        to: tx.to,
        data: tx.data,
        value: tx.value, // make sure this is BigNumberish (string, number, or BigNumber)
    }));
    return { transactions };
};
exports.getTransactionFromRoutePlanZeroG = getTransactionFromRoutePlanZeroG;
