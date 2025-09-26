
import { Edge, EdgeData, FunctionToMutateTheEdgeCostType, Graph, TokenBiMap } from "@deserialize-evm-agg/graph";
import { NetworkType } from "@deserialize-evm-agg/swap-contract-sdk/dist/interfaces/js/networkSetup";
import { Decimal } from "decimal.js";
import { JsonRpcProvider, TransactionRequest } from "ethers";
import { DexConfig } from "UniswapV3Calculator";

export interface DeserializeRoutePlan<DexIdTypes> {
    tokenA: string;
    tokenB: string;
    fee: number;
    poolAddress: string;
    aToB: boolean
    dexId: DexIdTypes;
}

export interface SwapQuoteParam<PoolData> {
    aToB: boolean,
    amountIn: number,
    pool: PoolData,

}

export interface SwapQuoteParamWithoutAmount<PoolData>
    extends Omit<SwapQuoteParam<PoolData>, "amountIn"> { }
export interface SwapQuoteParamWithEdgeData<PoolData>
    extends EdgeData,
    SwapQuoteParamWithoutAmount<PoolData> { }


export interface SwapQuoteParamWithEdgeDataString extends EdgeData {
    aToB: boolean,
    pool: any
}

export interface IRoute<TPool, DexIdTypes> {
    name: DexIdTypes;
    network: NetworkType
    getDexConfig: () => DexConfig
    getTokenBiMap: <T>(provider?: JsonRpcProvider) => Promise<TokenBiMap<T>>;
    getGraph: (
        provider?: JsonRpcProvider,
        _tokenBiMap?: TokenBiMap<TPool>,
        ignoreCache?: boolean
    ) => Promise<Graph>;
    getFunctionToMutateEdgeCost: <
        T extends EdgeData
    >() => FunctionToMutateTheEdgeCostType<T>;

    getNewTokenBiMap: <T>(provider: JsonRpcProvider) => Promise<TokenBiMap<T>>;
    getNewGraph: (
        tokenBiMap: TokenBiMap<TPool>,
        provider: JsonRpcProvider
    ) => Promise<Graph>;
    getTransactionInstructionFromRoutePlan: (
        amountFormattedToTokenDecimal: Decimal,
        routePlan: DeserializeRoutePlan<DexIdTypes>[],
        wallet: string,
        slippage: number,
        isNativeIn: boolean,
        isNativeOut: boolean
    ) => Promise<{
        transactions: TransactionRequest[];
        amountOut?: Decimal;
        feeAmount?: Decimal;
    }>;
    listTokens: () => Promise<string[]>
    getAmountOutFromPlan: (
        amountFormattedToTokenDecimal: Decimal,
        routePlan: DeserializeRoutePlan<DexIdTypes>[],
        devFeeRate: number,
        provider?: JsonRpcProvider
    ) => Promise<{
        amountOut: Decimal;
    }>;

    getEdgeDataDirect?: <T extends TPool, R extends EdgeData>(
        provider: JsonRpcProvider,
        data: T,
        r: boolean
    ) => Promise<R | null>;
    getEdgeDataReverse?: <T extends TPool, R extends EdgeData>(
        provider: JsonRpcProvider,
        data: T,
        r: boolean
    ) => Promise<R | null>;
    formatPool: (pool: any) => TPool;

    getTokenPairEdgeData: (
        tokenA: string,
        tokenB: string
    ) => Promise<Edge<EdgeData> | null>;

    calculateRoutePrice: (route: DeserializeRoutePlan<DexIdTypes>[]) => Promise<number>;

    getTokenXAndYFromPool: (pool: TPool) => {
        tokenX: string;
        tokenY: string;
    };
}