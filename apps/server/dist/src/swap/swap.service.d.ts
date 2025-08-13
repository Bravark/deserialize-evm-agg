import { SwapQuoteRequestType } from "./swap.schema";
import Decimal from "decimal.js";
export declare const swapQuoteService: (params: SwapQuoteRequestType["body"]) => Promise<{
    tokenA: string;
    tokenB: string;
    amountIn: string;
    amountOut: Decimal;
    tokenPrice: string;
    routePlan: import("@deserialize-evm-agg/routes-providers").DeserializeRoutePlan<"ZERO_G">[];
    dexId: "ZERO_G";
}>;
