// import { Connection, PublicKey } from "@solana/web3.js";
// import { IRoute, TokenBiMap } from "../IRoute";
// import { DEX_IDS, DexIdTypes } from "../types";
// import {
//   getDexGraphCache,
//   getDexTokenIndexBiMapCache,
//   setDexGraphCache,
//   setDexTokenIndexBiMapCache,
// } from "../../../cache";
// import { ArrayBiMap } from "../../../graph/BiMap";
// import { InvariantRoute } from "../invariant/invariant";
// import { OrcaRoute } from "../orca/orca";
// import { getRouteProvider } from "..";
// import {
//   Edge,
//   FunctionToMutateTheEdgeCostType,
//   Graph,
// } from "../../../graph/graph";
// import { token } from "@coral-xyz/anchor/dist/cjs/utils";
// import Decimal from "decimal.js";
// import { DeserializeRoutePlan } from "../../types";
// import { mainLogger } from "../../../../logger";
// import { Instruction } from "@orca-so/common-sdk";
// import { ApiError } from "../../../../errors/errors.api";
// import { LifinityRoute } from "../lifinity/lifinity";
// import { UmbraRoute } from "../umbra/umbra";
// import { DEX_ERRORS } from "../../../../errors/errors.enum";
// type ElementType<T> = T extends (infer U)[] ? U : never;
// const logger = mainLogger.child({ service: "ALL Swap" });
// export interface AllPoolMapType extends Map<DexIdTypes, any> {}
// export type CacheAllPoolMapType = [DexIdTypes, any][];
// export type CacheAllPoolMapSingle = ElementType<CacheAllPoolMapType>;
// type RouteConstructor<T = any> = new (...args: any[]) => IRoute<T>;
// export const ALL_ROUTES_PROVIDERS: RouteConstructor[] = [
//   OrcaRoute,
//   InvariantRoute,
//   LifinityRoute,
//   UmbraRoute,
// ];
// export class AllRoute implements IRoute<any> {
//   name = DEX_IDS.ALL;
//   connection: Connection;
//   constructor(connection: Connection) {
//     this.connection = connection;
//   }

//   static formatPool = (data: CacheAllPoolMapSingle) => {
//     //convert the map into an array so that we can map through it
//     const formattedPoolData: any = [];
//     const dexId = data[0];
//     const poolData = data[1];
//     //here we will handle the formatting of the pool per the dex
//     const routeProvider = getRouteProvider(dexId);
//     poolData.map((pool: any) => {
//       const formattedData = routeProvider.formatPool(pool);
//       formattedPoolData.push(formattedData);
//     });

//     return [dexId, formattedPoolData];
//   };

//   getTokenBiMap = async <T>(
//     connection?: Connection
//   ): Promise<TokenBiMap<T>> => {
//     const cachedData = await getDexTokenIndexBiMapCache<T>(
//       this.name,
//       this.formatPool as (pool: any) => T
//     );

//     if (cachedData) {
//       return cachedData;
//     }
//     const tokenBiMap = await this.getNewTokenBiMap<T[]>(
//       connection || this.connection
//     );
//     setDexTokenIndexBiMapCache(this.name, tokenBiMap);
//     return tokenBiMap;
//   };

//   getTransactionInstructionFromRoutePlan = async (
//     amountFormattedToTokenDecimal: Decimal,
//     routePlan: DeserializeRoutePlan[],
//     publicKey: PublicKey,
//     devFeeRate: number,
//     partnerFeeAddress?: PublicKey,
//     connection?: Connection
//   ) => {
//     return await getTransactionInstructionFromRoutePlanAll(
//       amountFormattedToTokenDecimal,
//       routePlan,
//       publicKey,
//       connection || this.connection,
//       devFeeRate,
//       partnerFeeAddress
//     );
//   };

//   getAmountOutFromPlan = async (
//     amountFormattedToTokenDecimal: Decimal,
//     routePlan: DeserializeRoutePlan[],
//     devFeeRate: number,
//     connection?: Connection
//   ) => {
//     return await getTransactionInstructionFromRoutePlanSImulationAll(
//       amountFormattedToTokenDecimal,
//       routePlan,
//       connection || this.connection,
//       devFeeRate
//     );
//   };
//   formatPool = (pool: any) => {
//     return AllRoute.formatPool(pool);
//   };

//   getGraph = async (
//     connection?: Connection,
//     _tokenBiMap?: TokenBiMap<any>,
//     ignoreCache?: boolean
//   ): Promise<Graph> => {
//     if (!ignoreCache) {
//       const cachedData = await getDexGraphCache(this.name);
//       if (cachedData) {
//         // console.log("Cache Exit....");
//         return cachedData as Graph;
//       }
//     }
//     let tokenBiMap;
//     if (_tokenBiMap) {
//       tokenBiMap = _tokenBiMap;
//     } else {
//       tokenBiMap = await this.getTokenBiMap<any>(connection);
//     }

//     const graph = await this.getNewGraph(
//       tokenBiMap,
//       connection || this.connection
//     );
//     setDexGraphCache(this.name, graph);
//     return graph;
//   };

//   getNewTokenBiMap = async <T>(
//     connection?: Connection
//   ): Promise<{
//     tokenBiMap: ArrayBiMap<string>;
//     data: T;
//     tokenPoolMap: Map<string, string>;
//   }> => {
//     // Fetch token data
//     const tokenBiMap = new ArrayBiMap<string>();
//     const tokenPoolMap = new Map<string, string>();
//     const data = new Map<string, any>();

//     for (const routeProvider of ALL_ROUTES_PROVIDERS) {
//       const route = new routeProvider(connection || this.connection);
//       const {
//         tokenBiMap: routeTokenBiMap,
//         tokenPoolMap: routeTokenPoolMap,
//         data: routeData,
//       } = await route.getTokenBiMap();
//       routeTokenBiMap
//         .toArray()
//         .map((token) => tokenBiMap.setArrayValue(`${token}`));
//       routeTokenPoolMap.forEach((value, key) => {
//         tokenPoolMap.set(`${key}:${route.name}`, value);
//       });
//       data.set(route.name, routeData);
//     }

//     return { data: [...data.entries()] as T, tokenBiMap, tokenPoolMap };
//   };

//   getNewGraph = async (
//     tokenBiMap?: TokenBiMap<any>,
//     _connection?: Connection
//   ) => {
//     const connection = _connection || this.connection;

//     let tokenIndexBiMap;
//     let data;
//     if (tokenBiMap) {
//       tokenIndexBiMap = tokenBiMap.tokenBiMap;
//       data = tokenBiMap.data;
//     } else {
//       const { tokenBiMap, data: _data } = await this.getTokenBiMap<any>(
//         connection
//       );
//       data = _data;
//       tokenIndexBiMap = tokenBiMap;
//     }
//     console.log("data: ", data.length);
//     // Initialize graph
//     const totalLength = data.reduce((a, b) => a + b[1].length, 0);
//     const graph: Graph = Array.from({ length: totalLength }, () => []);

//     //for the dexId in the data
//     console.log("totalLength: ", totalLength);
//     try {
//       await Promise.all(
//         data.map(async (dexData, i) => {
//           // console.log("dexData: ", dexData[0]);
//           const [dexId, poolData] = dexData;
//           const route = new (getRouteProvider(dexId))(connection);
//           const routeTokenBiMap = await route.getTokenBiMap<any>();
//           // console.log("routeTokenBiMap: ", routeTokenBiMap);
//           const routeGraph = await route.getGraph(
//             connection,
//             routeTokenBiMap,
//             true
//           );
//           poolData.map((wp: any) => {
//             // console.log("wp: ", wp);
//             if (dexId === "ALL") {
//               throw Error("Cannot have ALL Route inside an All Route Method");
//             }
//             const { tokenX, tokenY } = route.getTokenXAndYFromPool(wp);
//             let tokenA: PublicKey = tokenX;
//             let tokenB: PublicKey = tokenY;

//             const fromTokenIndex = routeTokenBiMap.tokenBiMap.getByValue(
//               tokenA.toBase58()
//             );
//             const toTokenIndex = routeTokenBiMap.tokenBiMap.getByValue(
//               tokenB.toBase58()
//             );
//             if (fromTokenIndex === undefined) {
//               // console.log("tokenIndexBiMap: ", tokenIndexBiMap);
//               // console.log(
//               //   `could not find token ${tokenA}/fromTokenIndex in the map `
//               // );
//               return;
//             }
//             if (toTokenIndex === undefined) {
//               // console.log(
//               //   `could not find token ${tokenB}/toTokenIndex in the map`
//               // );
//               return;
//             }

//             const dexDirectEdge = routeGraph[fromTokenIndex].find(
//               (r) => r.from === fromTokenIndex && r.to === toTokenIndex
//             );

//             const dexReverseEdge = routeGraph[toTokenIndex].find(
//               (r) => r.from === toTokenIndex && r.to === fromTokenIndex
//             );

//             const fromTokenIndexInAllGraph = tokenIndexBiMap.getByValue(
//               `${tokenA}`
//             );
//             const toTokenIndexInAllGraph = tokenIndexBiMap.getByValue(
//               `${tokenB}`
//             );

//             if (fromTokenIndexInAllGraph === undefined) {
//               // console.log("tokenIndexBiMap: ", tokenIndexBiMap);
//               // console.log(
//               //   `could not find token ${tokenA} in the Main All map `
//               // );
//               return;
//             }
//             if (toTokenIndexInAllGraph === undefined) {
//               // console.log(`could not find token ${tokenB} in Main All the map`);
//               return;
//             }
//             if (dexDirectEdge === undefined || dexReverseEdge === undefined) {
//               console.log(
//                 `no edge found between ${tokenA} and ${tokenB} on ${dexId}`
//               );
//               return;
//             }

//             const directEdge = new Edge(
//               fromTokenIndexInAllGraph,
//               toTokenIndexInAllGraph,
//               dexDirectEdge.edgeData
//             );

//             const reverseEdge = new Edge(
//               toTokenIndexInAllGraph,
//               fromTokenIndexInAllGraph,
//               dexReverseEdge.edgeData
//             );
//             // Append edges to the graph
//             if (graph[fromTokenIndexInAllGraph]) {
//               graph[Number(fromTokenIndexInAllGraph)].push(directEdge);
//             } else {
//               graph[Number(fromTokenIndexInAllGraph)] = [directEdge];
//             }

//             if (graph[toTokenIndexInAllGraph]) {
//               graph[Number(toTokenIndexInAllGraph)].push(reverseEdge);
//             } else {
//               graph[Number(toTokenIndexInAllGraph)] = [reverseEdge];
//             }
//           });
//         })
//       );
//     } catch (error) {
//       console.log("error: ", error);
//     }

//     console.log("DONE getting new graph for all....");

//     return graph;
//   };

//   getFunctionToMutateEdgeCost = () => {
//     //?i should find a way to properly type the below generic instead of using "any"
//     let func: FunctionToMutateTheEdgeCostType<any>;

//     func = (params, e) => {
//       const routeProvider = new (getRouteProvider(params.dexId))(
//         this.connection
//       );

//       const functionToMutateEdge = routeProvider.getFunctionToMutateEdgeCost();
//       return functionToMutateEdge(params, e);
//     };
//     return func;
//   };
//   getTokenPairEdgeData = async (tokenA: PublicKey, tokenB: PublicKey) => {
//     const routeData = await this.getTokenBiMap(this.connection);
//     const tokenAIndex = routeData.tokenBiMap.getByValue(tokenA.toBase58());
//     // console.log("tokenAIndex: ", tokenAIndex);
//     const tokenBIndex = routeData.tokenBiMap.getByValue(tokenB.toBase58());
//     // console.log("tokenBIndex: ", tokenBIndex);
//     if (tokenAIndex === undefined || tokenBIndex === undefined) {
//       throw new ApiError(406, DEX_ERRORS.PAIR_NOT_AVAILABLE_ON_DEX);
//     }
//     const graph = await this.getGraph();
//     const edges = graph[tokenAIndex];
//     const edgeData = edges.find((e) => e.to === tokenBIndex);
//     if (!edgeData) {
//       console.log("this name: ", this.name);
//       return null;
//     }
//     return edgeData;
//   };
//   calculateRoutePrice = async (
//     route: DeserializeRoutePlan[]
//   ): Promise<number> => {
//     let finalPrice = 1;

//     // Iterate over each segment in the route.
//     for (const segment of route) {
//       try {
//         // Try to get the price from the edge data between the tokens.
//         // This function may throw if no edge exists.
//         const edgeData = await this.getTokenPairEdgeData(
//           new PublicKey(segment.tokenA),
//           new PublicKey(segment.tokenB)
//         );
//         if (!edgeData) {
//           throw new ApiError(
//             404,
//             `Price not available for token pair ${segment.tokenA} - ${segment.tokenB}`
//           );
//         }
//         // Assume that edgeData contains a 'price' field.
//         finalPrice *= edgeData.edgeData.price;
//       } catch (error) {
//         // If the edge data isn't available, fall back to using a price provided on the segment.

//         throw new ApiError(
//           404,
//           `Price not available for token pair ${segment.tokenA} - ${segment.tokenB}`
//         );
//       }
//     }

//     return finalPrice;
//   };

//   getTokenXAndYFromPool = (pool: any) => {
//     throw new Error(
//       "This Method should only be called by the individual route"
//     );
//   };
// }

// export const getTransactionInstructionFromRoutePlanAll = async (
//   amountFormattedToTokenDecimal: Decimal,
//   routePlan: DeserializeRoutePlan[],
//   publicKey: PublicKey,
//   connection: Connection,
//   devFeeRate: number,
//   partnerFeeAddress?: PublicKey,
//   collectFeesPerRouteFroAllRoute = false
// ) => {
//   let inXs: Instruction[] = [];
//   let currentAmountIn = new Decimal(amountFormattedToTokenDecimal);
//   let firstFee: Decimal = new Decimal(0);
//   for (let i = 0; i < routePlan.length; i++) {
//     const plan = routePlan[i];

//     const route = new (getRouteProvider(plan.dexId))(connection);
//     const _devFeeRate = collectFeesPerRouteFroAllRoute
//       ? (devFeeRate as any)
//       : i === 0
//       ? (devFeeRate as any)
//       : 0;
//     const {
//       inXs: _inXs,
//       amountOut,
//       feeAmount,
//     } = await route.getTransactionInstructionFromRoutePlan(
//       currentAmountIn,
//       [plan],
//       publicKey,
//       _devFeeRate,
//       partnerFeeAddress,
//       connection
//     );
//     if (i === 0) {
//       firstFee = feeAmount;
//     }
//     inXs.push(..._inXs);
//     currentAmountIn = new Decimal(amountOut);
//   }

//   return { inXs, amountOut: currentAmountIn, feeAmount: new Decimal(0) };
// };

// export const getTransactionInstructionFromRoutePlanSImulationAll = async (
//   amountFormattedToTokenDecimal: Decimal,
//   routePlan: DeserializeRoutePlan[],
//   connection: Connection,
//   devFeeRate: number
// ) => {
//   let inXs: Instruction[] = [];
//   let currentAmountIn = new Decimal(amountFormattedToTokenDecimal);

//   for (const plan of routePlan) {
//     // console.log("plan: ", plan);
//     const route = new (getRouteProvider(plan.dexId))(connection);
//     const { amountOut } = await route.getAmountOutFromPlan(
//       currentAmountIn,
//       [plan],
//       devFeeRate as any,
//       connection
//     );

//     currentAmountIn = new Decimal(amountOut);
//   }

//   return { amountOut: currentAmountIn };
// };
