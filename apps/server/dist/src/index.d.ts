import { DexCache } from "@deserialize-evm-agg/cache";
import { DeserializeRoutePlan, DexIdTypes, IRoute } from "@deserialize-evm-agg/routes-providers";
import { JsonRpcProvider } from "ethers";
export interface RouteOptions {
    targetRouteNumber: number;
}
export declare const getRouteJsonRpcProvider: (dexId: DexIdTypes) => (new (provider: import("ethers").JsonRpcProvider, cache: import("@deserialize-evm-agg/cache").DexCache<string>) => import("@deserialize-evm-agg/routes-providers/dist/v3Route").BaseV3Route<string>) | import("@deserialize-evm-agg/routes-providers/dist/AllContructor").AllRouteConstructor<string>;
export declare const initAndGetCache: () => Promise<DexCache<DexIdTypes>>;
export declare const getBestRoutes: (dexId: DexIdTypes, fromTokenString: string, toTokenString: string, amount: number, _provider: JsonRpcProvider, options?: RouteOptions) => Promise<{
    routes: DeserializeRoutePlan<DexIdTypes>[];
    RouteJsonRpcProvider: IRoute<any, DexIdTypes>;
    bestOutcome: number;
}>;
export declare const getRoutePlanFromTokenStringPath: (tokenStringPath: string[][], dexId: DexIdTypes) => Promise<DeserializeRoutePlan<DexIdTypes>[]>;
