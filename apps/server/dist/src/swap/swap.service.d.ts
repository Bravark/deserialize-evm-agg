import { JsonRpcProvider } from "ethers";
import { SwapQuoteRequestType, SwapRequestType } from "./swap.schema";
import Decimal from "decimal.js";
export declare const swapQuoteService: (params: SwapQuoteRequestType, provider: JsonRpcProvider) => Promise<{
    tokenA: string;
    tokenB: string;
    amountIn: string;
    amountOut: Decimal;
    tokenPrice: string;
    routePlan: import("@deserialize-evm-agg/routes-providers").DeserializeRoutePlan<import("../index").DexIdTypes>[];
    dexId: "ZERO_G";
    dexFactory: any;
    isNativeIn: boolean;
    isNativeOut: boolean;
}>;
export declare const swapService: (params: SwapRequestType, provider: JsonRpcProvider) => Promise<{
    transaction: {
        transactions: import("ethers").TransactionRequest[];
    };
}>;
export declare const tokenList: (provider: JsonRpcProvider) => Promise<string[]>;
export declare const getTokenPriceService: (tokenAddress: string, provider: JsonRpcProvider) => Promise<number>;
export declare const getTokenDetailsService: (tokenAddress: string, provider: JsonRpcProvider) => Promise<{}>;
