import { JsonRpcProvider, TransactionRequest } from "ethers";
import { DeserializeRoutePlan, IRoute } from "../IRoute";
import { DexConfig, PoolData, UniswapV3QuoteCalculator } from "../UniswapV3Calculator";
import Decimal from "decimal.js";
import { ArrayBiMap, Edge, EdgeData, FunctionToMutateTheEdgeCostType, Graph, TokenBiMap } from "@deserialize-evm-agg/graph";
import { DexCache } from "@deserialize-evm-agg/cache";
import { NetworkType } from "@deserialize-evm-agg/swap-contract-sdk/dist/interfaces/js/networkSetup";
export declare class ZeroGTestnetRoute<DexIdTypes> implements IRoute<PoolData, DexIdTypes> {
    name: DexIdTypes;
    provider: JsonRpcProvider;
    cache: DexCache<DexIdTypes>;
    dexConfig: DexConfig;
    calculator: UniswapV3QuoteCalculator;
    network: NetworkType;
    static network: NetworkType;
    static config: DexConfig;
    constructor(provider: JsonRpcProvider, cache: DexCache<DexIdTypes>);
    getDexConfig: () => DexConfig;
    getTransactionInstructionFromRoutePlan: (amountFormattedToTokenDecimal: Decimal, routePlan: DeserializeRoutePlan<DexIdTypes>[], wallet: string, slippage: number) => Promise<{
        transactions: TransactionRequest[];
    }>;
    getAmountOutFromPlan: (amountFormattedToTokenDecimal: Decimal, routePlan: DeserializeRoutePlan<DexIdTypes>[], devFeeRate: number, provider?: JsonRpcProvider) => Promise<{
        amountOut: Decimal;
    }>;
    getEdgeDataReverse?: (<T extends PoolData, R extends EdgeData>(provider: JsonRpcProvider, data: T, r: boolean) => Promise<R | null>) | undefined;
    formatPool: (pool: any) => PoolData;
    static formatPool: (pool: PoolData) => PoolData;
    getTokenBiMap: <PoolData>(provider?: JsonRpcProvider) => Promise<TokenBiMap<PoolData>>;
    getNewTokenBiMap: <T>(provider: JsonRpcProvider) => Promise<{
        tokenBiMap: ArrayBiMap<string>;
        data: T[];
        tokenPoolMap: Map<string, string>;
    }>;
    getGraph: (provider?: JsonRpcProvider, _tokenBiMap?: TokenBiMap<PoolData>, ignoreCache?: boolean) => Promise<Graph>;
    getNewGraph: (tokenBiMap?: TokenBiMap<PoolData>, _provider?: JsonRpcProvider) => Promise<Graph>;
    getEdgeDataDirect: <T extends PoolData, R>(provider: JsonRpcProvider, data: T, r: boolean) => Promise<R | null>;
    getFunctionToMutateEdgeCost: () => FunctionToMutateTheEdgeCostType<any>;
    getTokenPairEdgeData: (tokenA: string, tokenB: string) => Promise<Edge<EdgeData> | null>;
    calculateRoutePrice: (route: DeserializeRoutePlan<DexIdTypes>[]) => Promise<number>;
    listTokens: () => Promise<string[]>;
    getTokenXAndYFromPool: (pool: PoolData) => {
        tokenX: string;
        tokenY: string;
    };
}
export declare class ZeroGRoute<DexIdTypes> implements IRoute<PoolData, DexIdTypes> {
    name: DexIdTypes;
    provider: JsonRpcProvider;
    cache: DexCache<DexIdTypes>;
    dexConfig: DexConfig;
    calculator: UniswapV3QuoteCalculator;
    network: NetworkType;
    static network: NetworkType;
    static config: DexConfig;
    constructor(provider: JsonRpcProvider, cache: DexCache<DexIdTypes>);
    getDexConfig: () => DexConfig;
    getTransactionInstructionFromRoutePlan: (amountFormattedToTokenDecimal: Decimal, routePlan: DeserializeRoutePlan<DexIdTypes>[], wallet: string, slippage: number) => Promise<{
        transactions: TransactionRequest[];
    }>;
    getAmountOutFromPlan: (amountFormattedToTokenDecimal: Decimal, routePlan: DeserializeRoutePlan<DexIdTypes>[], devFeeRate: number, provider?: JsonRpcProvider) => Promise<{
        amountOut: Decimal;
    }>;
    getEdgeDataReverse?: (<T extends PoolData, R extends EdgeData>(provider: JsonRpcProvider, data: T, r: boolean) => Promise<R | null>) | undefined;
    formatPool: (pool: any) => PoolData;
    static formatPool: (pool: PoolData) => PoolData;
    getTokenBiMap: <PoolData>(provider?: JsonRpcProvider) => Promise<TokenBiMap<PoolData>>;
    getNewTokenBiMap: <T>(provider: JsonRpcProvider) => Promise<{
        tokenBiMap: ArrayBiMap<string>;
        data: T[];
        tokenPoolMap: Map<string, string>;
    }>;
    listTokens: () => Promise<string[]>;
    getGraph: (provider?: JsonRpcProvider, _tokenBiMap?: TokenBiMap<PoolData>, ignoreCache?: boolean) => Promise<Graph>;
    getNewGraph: (tokenBiMap?: TokenBiMap<PoolData>, _provider?: JsonRpcProvider) => Promise<Graph>;
    getEdgeDataDirect: <T extends PoolData, R>(provider: JsonRpcProvider, data: T, r: boolean) => Promise<R | null>;
    getFunctionToMutateEdgeCost: () => FunctionToMutateTheEdgeCostType<any>;
    getTokenPairEdgeData: (tokenA: string, tokenB: string) => Promise<Edge<EdgeData> | null>;
    calculateRoutePrice: (route: DeserializeRoutePlan<DexIdTypes>[]) => Promise<number>;
    getTokenXAndYFromPool: (pool: PoolData) => {
        tokenX: string;
        tokenY: string;
    };
}
export declare const getTransactionInstructionFromRoutePlanZeroG: <DexIdTypes>(amountFormattedToTokenDecimal: Decimal, routePlan: DeserializeRoutePlan<DexIdTypes>[], connection: JsonRpcProvider) => Promise<{
    amountOut: Decimal;
}>;
export declare const getTransactionFromRoutePlanZeroG: <DexIdTypes>(amountIn: Decimal, amountOut: Decimal, routePlan: DeserializeRoutePlan<DexIdTypes>[], wallet: string, slippage: number, connection: JsonRpcProvider) => Promise<{
    transactions: TransactionRequest[];
}>;
