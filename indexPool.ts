
// import { ArrayBiMap } from "./routeService/graph/BiMap";
// import { checkIfGraphIsEmpty, Edge, EdgeData, findBestRouteIndex, FunctionToMutateTheEdgeCostType, Graph } from "./routeService/graph/graph";
// import { Decimal } from "decimal.js";
// import { calculateSpotPrice, FACTORY_ADDRESS, getAllHighestLiquidityPoolZeroDex, getAmountOut, getTokenDetails, getSureTokenPrice, PoolData, provider, ZeroDexQuoteParams, simulateZeroGTransaction, getPoolData } from "./providers/routeProviders/sample.ethers";
// import { getDexGraphCache, getDexTokenIndexBiMapCache, setDexGraphCache, setDexTokenIndexBiMapCache } from "./routeService/cache";
// import { JsonRpcProvider, TransactionRequest } from "ethers";

// import { RouteOptions } from "./routeService/swapProviders/graphs/types";
// import { createSwapTX } from "./swap-contract-sdk/src";
// import { DeserializeRoutePlan } from "@deserialize-evm-agg/routes-providers";




// // here will index the pool

// // what shape will the index have?
// // it will be a map of token pairs to pools

// (BigInt.prototype as any).toJSON = function () {
//     const int = Number.parseInt(this.toString());
//     return int ?? this.toString();
// };

// //for each dex, it will have a RouteJsonRpcProvider that will give us information about a particular dex route
// export const DEX_IDS = {
//     ZERO_G: "ZERO_G",

// } as const;



// export type DexIdTypes = (typeof DEX_IDS)[keyof typeof DEX_IDS];





// export const getRouteJsonRpcProvider = (dexId: DexIdTypes) => {
//     if (dexId === DEX_IDS.ZERO_G) {
//         return ZeroGRoute;
//     }
//     throw new Error(`No route provider for ${dexId}`);
// };
// export const getBestRoutes = async (
//     dexId: DexIdTypes,
//     fromTokenString: string,
//     toTokenString: string,
//     amount: number,
//     _provider = provider,
//     options?: RouteOptions
// ): Promise<{
//     routes: DeserializeRoutePlan[];
//     RouteJsonRpcProvider: IRoute<any>;
//     bestOutcome: number;

// }> => {

//     const RouteJsonRpcProviderClass = getRouteJsonRpcProvider(dexId);
//     const RouteJsonRpcProvider = new RouteJsonRpcProviderClass(provider);
//     // console.log("getting token bi map...");
//     const { tokenBiMap } = await RouteJsonRpcProvider.getTokenBiMap();
//     // console.log('tokenBiMap: ', tokenBiMap);
//     // console.log("getting graph...");
//     const graph = await RouteJsonRpcProvider.getGraph();
//     let path: number[][] = [];
//     let keyRate;
//     // let tokenAUsdRate = await RouteJsonRpcProvider.getTokenPairEdgeData(
//     //   new PublicKey(fromTokenString),
//     //   new PublicKey(toTokenString)
//     // );
//     // if (!tokenAUsdRate) {
//     keyRate = await getSureTokenPrice((fromTokenString), provider);
//     console.log("keyRate here: ", keyRate);
//     // } else {
//     //   keyRate = tokenAUsdRate.edgeData.priceUsdc ?? 0;
//     //   console.log("keyRate here here: ", keyRate);
//     // }
//     // console.log("graph: ", graph[0]);
//     const fromIndex = tokenBiMap.getByValue(fromTokenString);
//     const toIndex = tokenBiMap.getByValue(toTokenString);
//     if (fromIndex === undefined || toIndex === undefined) {
//         console.log(
//             "Token not found in the tokenBiMap: Token Not yet Supported by the Selected Dex"
//         );
//         console.log("tokenBiMap: ", tokenBiMap);
//         throw new Error("DEX_ERRORS.PAIR_NOT_AVAILABLE_ON_DEX");
//     }
//     const func = RouteJsonRpcProvider.getFunctionToMutateEdgeCost();
//     const token = await getTokenDetails(
//         (fromTokenString),
//         provider,
//     );
//     const {
//         bestRoute: _path,
//         edgeData,
//         bestOutcome,
//     } = findBestRouteIndex(
//         graph,
//         fromIndex,
//         toIndex,
//         { key: amount, keyRate: keyRate ?? 0, keyDecimal: token.decimals },
//         options?.targetRouteNumber,
//         func
//     );
//     console.log('_path: ', _path);
//     path = _path;

//     if (path.length < 1) {
//         console.log("No route found");
//         throw new Error("No route found");
//     }
//     const tokenStringPath = convertEdgeListToTokenString(edgeData, tokenBiMap);
//     // console.log("tokenStringPath: ", { tokenStringPath });
//     // console.log("getting route plan from string...");
//     const routes: DeserializeRoutePlan[] = await getRoutePlanFromTokenStringPath(
//         tokenStringPath,
//         dexId
//     );

//     return { routes, RouteJsonRpcProvider, bestOutcome };
// };

// export const getRoutePlanFromTokenStringPath = async (
//     tokenStringPath: string[][],
//     dexId: DexIdTypes
// ): Promise<DeserializeRoutePlan[]> => {
//     const routes: DeserializeRoutePlan[] = [];
//     for (const plan of tokenStringPath) {
//         const routePlan: DeserializeRoutePlan = {
//             tokenA: plan[0],
//             tokenB: plan[1],
//             dexId: plan[2] as DexIdTypes,
//             poolAddress: plan[3],
//             aToB: plan[4] === "aToB" ? true : false,
//             fee: parseInt(plan[5], 10)
//         };
//         routes.push(routePlan);
//     }

//     return routes;
// };

// const convertEdgeListToTokenString = (
//     edges: Edge<EdgeData>[],
//     tokenBiMap: ArrayBiMap<string>
// ): string[][] => {
//     // console.log("path: ", edges);
//     // console.log("tokenBiMap: ", tokenBiMap);
//     return edges.map((edge) => {
//         return [
//             tokenBiMap.get(edge.from)!,
//             tokenBiMap.get(edge.to)!,
//             edge.edgeData.dexId,
//             edge.edgeData.poolAddress,
//             edge.edgeData.aToB ? "aToB" : "bToA",
//             edge.edgeData.fee.toString()
//         ];
//     });
// };



// export const getTransactionInstructionFromRoutePlanZeroG = async (
//     amountFormattedToTokenDecimal: Decimal,
//     routePlan: DeserializeRoutePlan[],
//     wallet: string,
//     connection: JsonRpcProvider,

// ) => {
//     routePlan.map((r) => {
//         if (r.dexId !== "ZERO_G") {
//             throw new Error(
//                 "One or all of the passed route is not a ZERO_G route path"
//             );
//         }
//     });

//     let currentAmountIn = new Decimal(amountFormattedToTokenDecimal);

//     for (let i = 0; i < routePlan.length; i++) {
//         const route = routePlan[i];
//         console.log("currentAmountIn: ", currentAmountIn);
//         const amountOut = await simulateZeroGTransaction(
//             route.tokenA,
//             route.tokenB,
//             currentAmountIn.toString(),
//             route.fee,
//         );

//         currentAmountIn = amountOut;
//     }

//     return { amountOut: currentAmountIn };
// };


// export const getTransactionFromRoutePlanZeroG = async (
//     amountIn: Decimal,
//     routePlan: DeserializeRoutePlan[],
//     wallet: string,
//     slippage: number,
//     connection: JsonRpcProvider // Now properly typed
// ) => {
//     const paths = transformRoutePlanToIPath(FACTORY_ADDRESS.zerodex, routePlan);

//     const slippageMultiplier = new Decimal(1).minus(slippage / 100);
//     const minAmountOut = amountIn.mul(slippageMultiplier);

//     const tx = await createSwapTX(
//         {
//             path: paths,
//             amountInRaw: amountIn.toString(),
//             minAmountOut: minAmountOut.toString(),
//         },
//         wallet, connection,
//     );

//     const transaction: TransactionRequest = {
//         from: wallet,
//         to: tx.to,
//         data: tx.data,
//         value: tx.value, // make sure this is BigNumberish (string, number, or BigNumber)
//     };

//     return { transactions: [transaction] };

// };


// export const getTransactionInstructionFromRoutePlanSimulationZeroG = async (
//     amountFormattedToTokenDecimal: Decimal,
//     routePlan: DeserializeRoutePlan[],
//     connection: JsonRpcProvider,
//     devFeeRate: number
// ) => {
//     routePlan.map((r) => {
//         if (r.dexId !== "ZERO_G") {
//             throw new Error(
//                 "One or all of the passed route is not an Lifinity route path"
//             );
//         }
//     });

//     let currentAmountIn = new Decimal(amountFormattedToTokenDecimal);

//     for (let i = 0; i < routePlan.length; i++) {
//         const route = routePlan[i];
//         console.log("currentAmountIn: ", currentAmountIn);
//         const amountOut = await simulateZeroGTransaction(
//             route.tokenA,
//             route.tokenB,
//             currentAmountIn.toString(),
//             route.fee,
//         );

//         currentAmountIn = amountOut;
//     }

//     return { amountOut: currentAmountIn };
// };

// type RouteConstructor<T = any> = new (...args: any[]) => IRoute<T>;
// export const ALL_ROUTES_PROVIDERS: RouteConstructor[] = [
//     ZeroGRoute,
// ];

// /**
//  * Determines if an edge's data is considered "empty"
//  * @param edgeData The edge data to check
//  * @returns True if the edge data is considered empty
//  */
// function isEmptyEdgeData(edgeData: EdgeData): boolean {
//     // Implement your logic to determine if edge data is empty
//     // This could be checking for null, undefined, empty object, specific properties, etc.
//     // Example:
//     return (
//         edgeData === null ||
//         edgeData === undefined ||
//         (typeof edgeData === "object" && Object.keys(edgeData).length === 0)
//     );
// }
// /**
//  * Updates empty edge data in the new graph with data from the old graph where edges match
//  * @param currentGraph The original graph with edge data to preserve
//  * @param updatedGraph The new graph structure whose empty edge data needs to be updated
//  * @returns The updated graph with preserved edge data for empty edges
//  */
// function updateGraphEdgeData(currentGraph: Graph, updatedGraph: Graph): Graph {
//     if (currentGraph.length < 1) {
//         return updatedGraph;
//     }
//     // Create a deep copy of the updated graph to avoid modifying the original
//     const resultGraph = structuredClone(currentGraph);

//     // Create a map for quick lookups of edges in the current graph
//     const edgeMap = new Map();

//     // Populate the map with all edges from the current graph
//     updatedGraph.forEach((edgeList) => {
//         edgeList.forEach((edge) => {
//             // Create a unique key for each edge based on from and to properties
//             const key = `${JSON.stringify(edge.from)}_${JSON.stringify(edge.to)}`;
//             edgeMap.set(key, edge.edgeData);
//         });
//     });

//     // Update only empty edges in the result graph where matches are found
//     resultGraph.forEach((edgeList: Edge<EdgeData>[], listIndex: number) => {
//         edgeList.forEach((edge, edgeIndex: number) => {
//             // Check if the edge is empty (you may need to adjust this condition based on how "empty" is defined)
//             const isEdgeEmpty = isEmptyEdgeData(edge.edgeData);
//             // console.log("isEdgeEmpty: ", isEdgeEmpty);

//             // if (isEdgeEmpty) {
//             const key = `${JSON.stringify(edge.from)}_${JSON.stringify(edge.to)}`;

//             // If this edge exists in the current graph, use its edge data
//             //Otherwise, keep the new edge data that came with updatedGraph
//             if (edgeMap.has(key)) {
//                 resultGraph[listIndex][edgeIndex].edgeData = edgeMap.get(key);
//             } else {
//                 resultGraph[listIndex][edgeIndex].edgeData = edge.edgeData;
//             }
//         });
//     });

//     return resultGraph;
// }

// export const getEvmTransactionFromRoutePlan = async (
//     amountFormattedToTokenDecimal: Decimal,
//     routePlan: DeserializeRoutePlan[],
//     wallet: string,
//     provider?: JsonRpcProvider,
// ): Promise<{
//     transaction: any
// }> => {

//     return { transaction: "" }
// }

// // const updateCacheData = async () => {

// //     for (const routeJsonRpcProvider of ALL_ROUTES_PROVIDERS) {
// //         const route = new routeJsonRpcProvider(provider);
// //         // console.log('route: ', route);

// //         const updatedTokenBiMap = await route.getTokenBiMap(provider);
// //         // console.log('updatedTokenBiMap: ', updatedTokenBiMap);
// //         // setDexTokenIndexBiMapCache(route.name, updatedTokenBiMap);
// //         // const currentGraph = await route.getGraph(provider);
// //         // console.log("currentGraph: ", route.name, currentGraph.length);
// //         const newGraph = await route.getGraph(provider);
// //         console.log("newGraph: ", route.name, newGraph);
// //         // const updatedGraph = updateGraphEdgeData(currentGraph, newGraph);
// //         // console.log("updatedGraph: ", route.name, updatedGraph.length);
// //         // const isGraphEmpty = checkIfGraphIsEmpty(updatedGraph);
// //         // console.log("isGraphEmpty: ", route.name, isGraphEmpty);
// //         // if (!isGraphEmpty) {
// //         //     setDexGraphCache(route.name, updatedGraph);
// //         // }
// //     }


// //     // //
// //     // // it is after that we will update the ALL
// //     // const allRoute = new AllRoute(connection);
// //     // const allUpdatedTokenBiMap = await allRoute.getNewTokenBiMap<any>(connection);
// //     // // console.log("allUpdatedTokenBiMap: ", allUpdatedTokenBiMap.tokenBiMap);
// //     // const allUpdatedGraph = await allRoute.getNewGraph(
// //     //     allUpdatedTokenBiMap,
// //     //     connection
// //     // );
// //     // console.log("allUpdatedGraph: ", allUpdatedGraph.length);
// //     // //TODO: NOT SURE IF I SHOULD CHECK IF GRAPH IS EMPTY
// //     // // if (!isGraphEmpty) {
// //     // setDexTokenIndexBiMapCache(allRoute.name, allUpdatedTokenBiMap as any);
// //     // setDexGraphCache(allRoute.name, allUpdatedGraph);
// //     // }
// // };
// // const CacheInterval = 1;
// // updateCacheData();
// // setInterval(() => {
// //     console.log("Updating cache data...");
// //     updateCacheData();
// // }, CacheInterval * 60 * 1000); // Convert minutes to milliseconds


// const userInput = {
//     tokenIn: "0x36f6414FF1df609214dDAbA71c84f18bcf00F67d",//BTC
//     tokenOut: "0x0fE9B43625fA7EdD663aDcEC0728DD635e4AbF7c", //ETH
//     amountIn: "1000000000000000000", // 100,000 usdc
//     slippage: 0.1, // 0.5% slippage
//     wallet: "0x3766c4a45e7a73874dbcaa51b1d73627cb9b9c1b"
// }

// const testQuote = async () => {

//     // const pool = await getPoolData("0x0A0EE9d9F13CB462bFaC5fB89692802502C3Ac60"
//     // );


//     // console.log('pool: ', pool);

//     // const out = getAmountOut({
//     //     pool,
//     //     aToB: true,
//     //     amountInFormattedInDecimal: new Decimal("1000000000000000000"),
//     // })
//     // console.log('out: ', out);
//     // console.log('out: ', out.price.toString());
//     // return

//     // const moreData = await getMoreDataForPool(
//     //     provider,
//     //     pool,
//     //     false,

//     // )
//     // console.log('moreData: ', moreData);

//     console.log("test")

//     const { routes, bestOutcome, RouteJsonRpcProvider } = await getBestRoutes(
//         DEX_IDS.ZERO_G,
//         userInput.tokenIn,
//         userInput.tokenOut,
//         parseFloat(userInput.amountIn),
//         provider,
//         {
//             targetRouteNumber: 5,
//         })

//     const { amountOut } =
//         await RouteJsonRpcProvider.getAmountOutFromPlan(
//             new Decimal(userInput.amountIn),
//             routes,
//             0,
//             provider

//         );
//     console.log('amountOut: ', amountOut);

//     const transaction = await RouteJsonRpcProvider.getTransactionInstructionFromRoutePlan(
//         new Decimal(userInput.amountIn),
//         routes,
//         userInput.wallet,
//         userInput.slippage,
//     );
//     console.log('transaction: ', transaction);



// }

// testQuote()
