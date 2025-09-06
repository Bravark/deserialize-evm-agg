import { SwapQuoteRequestType, SwapRequestType } from "./swap.schema";
import Decimal from "decimal.js";
export declare const swapQuoteService: (params: SwapQuoteRequestType) => Promise<{
    tokenA: string;
    tokenB: string;
    amountIn: string;
    amountOut: Decimal;
    tokenPrice: string;
    routePlan: import("@deserialize-evm-agg/routes-providers").DeserializeRoutePlan<import("../index").DexIdTypes>[];
    dexId: "ZERO_G";
    dexFactory: any;
}>;
export declare const swapService: (params: SwapRequestType) => Promise<{
    transaction: {
        transactions: import("ethers").TransactionRequest[];
    };
}>;
