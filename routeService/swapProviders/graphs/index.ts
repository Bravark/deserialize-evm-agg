// import { DeserializeRoutePlan } from "../types";

// import { SimulateSwapInterface } from "@invariant-labs/sdk-eclipse/lib/utils";
// import { Edge, EdgeData, findBestRouteIndex } from "../../graph/graph";
// import { ArrayBiMap } from "../../graph/BiMap";

// import { mainLogger } from "../../../logger";
// import { DEX_IDS, DexIdTypes, LocalPool, RouteOptions } from "./types";
// import { InvariantRoute } from "./invariant/invariant";
// import { ApiError } from "../../../errors/errors.api";

// import { SwapSimulationInterfaceLifinity } from "./lifinity/lifinityCore";
// import { LifinityRoute } from "./lifinity/lifinity";
// import { SwapSimulationInterfaceUmbra } from "./umbra/umbraCore";
// import { UmbraRoute } from "./umbra/umbra";

// import { getSureTokenPrice } from "../tokenPrice/tokenPrice";
// import { Provider } from "ethers";
// export const getRouteProvider = (dexId: DexIdTypes) => {
//   if (dexId === DEX_IDS.ZERO_G) {
//     return InvariantRoute;
//   }
//   throw new ApiError(404, `No route provider for ${dexId}`);
// };

// const logger = mainLogger.child({ service: "Graph" });
// export const getBestRoutes = async (
//   dexId: DexIdTypes,
//   fromTokenString: string,
//   toTokenString: string,
//   amount: number,
//   _provider?: Provider,
//   options?: RouteOptions
// ): Promise<{
//   routes: DeserializeRoutePlan[];

// }> => {
//   const RouteProviderClass = getRouteProvider(dexId);
//   const provider = _provider
//   const RouteProvider = new RouteProviderClass(provider);
//   // console.log("getting token bi map...");
//   const { tokenBiMap } = await RouteProvider.getTokenBiMap();
//   // console.log("getting graph...");
//   const graph = await RouteProvider.getGraph();
//   let path: number[][] = [];
//   let keyRate;
//   // let tokenAUsdRate = await RouteProvider.getTokenPairEdgeData(
//   //   new PublicKey(fromTokenString),
//   //   new PublicKey(toTokenString)
//   // );
//   // if (!tokenAUsdRate) {
//   keyRate = await getSureTokenPrice((fromTokenString), provider);
//   // console.log("keyRate here: ", keyRate);
//   // } else {
//   //   keyRate = tokenAUsdRate.edgeData.priceUsdc ?? 0;
//   //   console.log("keyRate here here: ", keyRate);
//   // }

//   // console.log("graph: ", graph[0]);
//   const fromIndex = tokenBiMap.getByValue(fromTokenString);
//   const toIndex = tokenBiMap.getByValue(toTokenString);
//   if (fromIndex === undefined || toIndex === undefined) {
//     console.log(
//       "Token not found in the tokenBiMap: Token Not yet Supported by the Selected Dex"
//     );
//     console.log("tokenBiMap: ", tokenBiMap);
//     throw new ApiError(406, "DEX_ERRORS.PAIR_NOT_AVAILABLE_ON_DEX");
//   }
//   const func = RouteProvider.getFunctionToMutateEdgeCost();
//   const { mint } = await getSureMint(
//     provider,
//     (fromTokenString)
//   );


//   const {
//     bestRoute: _path,
//     edgeData,
//     bestOutcome,
//   } = findBestRouteIndex(
//     graph,
//     fromIndex,
//     toIndex,
//     { key: amount, keyRate: keyRate ?? 0, keyDecimal: mint.decimals },
//     options?.targetRouteNumber,
//     func
//   );
//   path = _path;

//   if (path.length < 1) {
//     console.log("No route found");
//     throw new ApiError(404, "No route found");
//   }
//   const tokenStringPath = convertEdgeListToTokenString(edgeData, tokenBiMap);
//   // console.log("tokenStringPath: ", { tokenStringPath });
//   // console.log("getting route plan from string...");
//   const routes: DeserializeRoutePlan[] = await getRoutePlanFromTokenStringPath(
//     tokenStringPath,
//     dexId
//   );


//   return { routes };
// };

// const ISSUES_RESOLUTION_OPTIONS = {
//   USE_ORCA: "USE_ORCA",
//   REDUCE_TO_TWO_HOPS: "REDUCE_TO_TWO_HOPS",
//   NONE: "NONE",
// };



// //? INVARIANT INTERFACES
// export interface InvariantFunctionToMutateEdgeCostTypeString extends EdgeData {
//   xToY: boolean;
//   byAmountIn: boolean;
//   priceLimit: number | undefined;
//   slippage: number;
//   ticks: string;
//   tickmap: any;
//   pool: any;
//   maxVirtualCrosses: number | undefined;
//   maxCrosses: number | undefined;
// }
// export interface SimulateSwapInterfaceWithoutAmount
//   extends Omit<SimulateSwapInterface, "swapAmount"> { }
// export interface InvariantFunctionToMutateEdgeCostType
//   extends EdgeData,
//   SimulateSwapInterfaceWithoutAmount { }

// /**
//  * ? LIFINITY INTERFACES
//  */

// export interface LifinityFunctionToMutateEdgeCostTypeString extends EdgeData {
//   pool: string;
//   tradeDirection: string;
// }

// export interface SwapSimulationInterfaceLifinityWithoutAmount
//   extends Omit<SwapSimulationInterfaceLifinity, "sourceAmount"> { }

// export interface LifinityFunctionToMutateEdgeCostType
//   extends EdgeData,
//   SwapSimulationInterfaceLifinityWithoutAmount { }

// /**
//  * ? UMBRA INTERFACES
//  */

// export interface UmbraFunctionToMutateEdgeCostTypeString extends EdgeData {
//   poolData: string;
//   tokenIn: string;
// }

// export interface SwapSimulationInterfaceUmbraWithoutAmount
//   extends Omit<SwapSimulationInterfaceUmbra, "amount"> { }

// export interface UmbraFunctionToMutateEdgeCostType
//   extends EdgeData,
//   SwapSimulationInterfaceUmbraWithoutAmount { }

// const convertIndexListToTokenString = (
//   path: number[][],
//   tokenBiMap: ArrayBiMap<string>
// ): string[][] => {
//   // console.log("path: ", path);
//   // console.log("tokenBiMap: ", tokenBiMap);
//   return path.map((indexList) =>
//     indexList.map((index) => tokenBiMap.get(index)!)
//   );
// };

// const convertEdgeListToTokenString = (
//   edges: Edge<EdgeData>[],
//   tokenBiMap: ArrayBiMap<string>
// ): string[][] => {
//   // console.log("path: ", edges);
//   // console.log("tokenBiMap: ", tokenBiMap);
//   return edges.map((edge) => {
//     return [
//       tokenBiMap.get(edge.from)!,
//       tokenBiMap.get(edge.to)!,
//       edge.edgeData.dexId,
//     ];
//   });
// };




