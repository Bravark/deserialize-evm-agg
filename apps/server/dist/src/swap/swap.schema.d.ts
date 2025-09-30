import { z } from "zod";
export declare const SwapQuoteRequestSchema: z.ZodObject<{
    body: z.ZodObject<{
        tokenA: z.ZodString;
        tokenB: z.ZodString;
        amountIn: z.ZodEffects<z.ZodString, number, string>;
        dexId: z.ZodEnum<["ZERO_G"]>;
        options: z.ZodOptional<z.ZodObject<{
            targetRouteNumber: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            targetRouteNumber: number;
        }, {
            targetRouteNumber: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        tokenA: string;
        tokenB: string;
        amountIn: number;
        dexId: "ZERO_G";
        options?: {
            targetRouteNumber: number;
        } | undefined;
    }, {
        tokenA: string;
        tokenB: string;
        amountIn: string;
        dexId: "ZERO_G";
        options?: {
            targetRouteNumber: number;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        tokenA: string;
        tokenB: string;
        amountIn: number;
        dexId: "ZERO_G";
        options?: {
            targetRouteNumber: number;
        } | undefined;
    };
}, {
    body: {
        tokenA: string;
        tokenB: string;
        amountIn: string;
        dexId: "ZERO_G";
        options?: {
            targetRouteNumber: number;
        } | undefined;
    };
}>;
export type SwapQuoteRequestType = z.infer<typeof SwapQuoteRequestSchema>["body"];
export declare const SwapRequestSchema: z.ZodObject<{
    body: z.ZodObject<{
        publicKey: z.ZodString;
        quote: z.ZodObject<{
            tokenA: z.ZodString;
            tokenB: z.ZodString;
            amountIn: z.ZodEffects<z.ZodString, number, string>;
            amountOut: z.ZodEffects<z.ZodString, number, string>;
            tokenPrice: z.ZodEffects<z.ZodString, number, string>;
            feeRate: z.ZodOptional<z.ZodEffects<z.ZodString, number, string>>;
            routePlan: z.ZodArray<z.ZodObject<{
                tokenA: z.ZodString;
                tokenB: z.ZodString;
                poolAddress: z.ZodString;
                fee: z.ZodNumber;
                aToB: z.ZodBoolean;
                dexId: z.ZodEnum<["ZERO_G"]>;
            }, "strip", z.ZodTypeAny, {
                aToB: boolean;
                tokenA: string;
                tokenB: string;
                dexId: "ZERO_G";
                poolAddress: string;
                fee: number;
            }, {
                aToB: boolean;
                tokenA: string;
                tokenB: string;
                dexId: "ZERO_G";
                poolAddress: string;
                fee: number;
            }>, "many">;
            dexId: z.ZodEnum<["ALL"]>;
            isNativeIn: z.ZodBoolean;
            isNativeOut: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            amountOut: number;
            tokenA: string;
            tokenB: string;
            amountIn: number;
            dexId: "ALL";
            tokenPrice: number;
            routePlan: {
                aToB: boolean;
                tokenA: string;
                tokenB: string;
                dexId: "ZERO_G";
                poolAddress: string;
                fee: number;
            }[];
            isNativeIn: boolean;
            isNativeOut: boolean;
            feeRate?: number | undefined;
        }, {
            amountOut: string;
            tokenA: string;
            tokenB: string;
            amountIn: string;
            dexId: "ALL";
            tokenPrice: string;
            routePlan: {
                aToB: boolean;
                tokenA: string;
                tokenB: string;
                dexId: "ZERO_G";
                poolAddress: string;
                fee: number;
            }[];
            isNativeIn: boolean;
            isNativeOut: boolean;
            feeRate?: string | undefined;
        }>;
        slippage: z.ZodEffects<z.ZodNumber, number, number>;
        partnerFees: z.ZodOptional<z.ZodObject<{
            recipient: z.ZodString;
            fee: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            fee: number;
            recipient: string;
        }, {
            fee: number;
            recipient: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        publicKey: string;
        quote: {
            amountOut: number;
            tokenA: string;
            tokenB: string;
            amountIn: number;
            dexId: "ALL";
            tokenPrice: number;
            routePlan: {
                aToB: boolean;
                tokenA: string;
                tokenB: string;
                dexId: "ZERO_G";
                poolAddress: string;
                fee: number;
            }[];
            isNativeIn: boolean;
            isNativeOut: boolean;
            feeRate?: number | undefined;
        };
        slippage: number;
        partnerFees?: {
            fee: number;
            recipient: string;
        } | undefined;
    }, {
        publicKey: string;
        quote: {
            amountOut: string;
            tokenA: string;
            tokenB: string;
            amountIn: string;
            dexId: "ALL";
            tokenPrice: string;
            routePlan: {
                aToB: boolean;
                tokenA: string;
                tokenB: string;
                dexId: "ZERO_G";
                poolAddress: string;
                fee: number;
            }[];
            isNativeIn: boolean;
            isNativeOut: boolean;
            feeRate?: string | undefined;
        };
        slippage: number;
        partnerFees?: {
            fee: number;
            recipient: string;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        publicKey: string;
        quote: {
            amountOut: number;
            tokenA: string;
            tokenB: string;
            amountIn: number;
            dexId: "ALL";
            tokenPrice: number;
            routePlan: {
                aToB: boolean;
                tokenA: string;
                tokenB: string;
                dexId: "ZERO_G";
                poolAddress: string;
                fee: number;
            }[];
            isNativeIn: boolean;
            isNativeOut: boolean;
            feeRate?: number | undefined;
        };
        slippage: number;
        partnerFees?: {
            fee: number;
            recipient: string;
        } | undefined;
    };
}, {
    body: {
        publicKey: string;
        quote: {
            amountOut: string;
            tokenA: string;
            tokenB: string;
            amountIn: string;
            dexId: "ALL";
            tokenPrice: string;
            routePlan: {
                aToB: boolean;
                tokenA: string;
                tokenB: string;
                dexId: "ZERO_G";
                poolAddress: string;
                fee: number;
            }[];
            isNativeIn: boolean;
            isNativeOut: boolean;
            feeRate?: string | undefined;
        };
        slippage: number;
        partnerFees?: {
            fee: number;
            recipient: string;
        } | undefined;
    };
}>;
export type SwapRequestType = z.infer<typeof SwapRequestSchema>["body"];
export declare const TokenPriceRequestSchema: z.ZodObject<{
    params: z.ZodObject<{
        tokenAddress: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        tokenAddress: string;
    }, {
        tokenAddress: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        tokenAddress: string;
    };
}, {
    params: {
        tokenAddress: string;
    };
}>;
export type TokenPriceRequestType = z.infer<typeof TokenPriceRequestSchema>["params"];
export declare const TokenDetailsRequestSchema: z.ZodObject<{
    params: z.ZodObject<{
        tokenAddress: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        tokenAddress: string;
    }, {
        tokenAddress: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        tokenAddress: string;
    };
}, {
    params: {
        tokenAddress: string;
    };
}>;
export type TokenDetailsRequestType = z.infer<typeof TokenDetailsRequestSchema>["params"];
