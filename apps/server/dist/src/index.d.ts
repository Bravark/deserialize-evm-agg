import { DexCache } from "@deserialize-evm-agg/cache";
import { DeserializeRoutePlan, IRoute, ZeroGRoute } from "@deserialize-evm-agg/routes-providers";
import { JsonRpcProvider } from "ethers";
export declare const DEX_IDS: {
    readonly ZERO_G: "ZERO_G";
    readonly ALL: "ALL";
};
export declare const dexIdList: string[];
export type DexIdTypes = (typeof DEX_IDS)[keyof typeof DEX_IDS];
export interface RouteOptions {
    targetRouteNumber: number;
}
export declare const getRouteJsonRpcProvider: (dexId: DexIdTypes) => typeof ZeroGRoute;
export declare const initAndGetCache: () => Promise<DexCache<DexIdTypes>>;
export declare const getBestRoutes: (dexId: DexIdTypes, fromTokenString: string, toTokenString: string, amount: number, _provider: JsonRpcProvider, options?: RouteOptions) => Promise<{
    routes: DeserializeRoutePlan<DexIdTypes>[];
    RouteJsonRpcProvider: IRoute<any, DexIdTypes>;
    bestOutcome: number;
}>;
export declare const getRoutePlanFromTokenStringPath: (tokenStringPath: string[][], dexId: DexIdTypes) => Promise<DeserializeRoutePlan<DexIdTypes>[]>;
