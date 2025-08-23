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
            feeRate: z.ZodEffects<z.ZodString, number, string>;
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
            dexFactory: z.ZodString;
            dexId: z.ZodEnum<["ZERO_G"]>;
        }, "strip", z.ZodTypeAny, {
            amountOut: number;
            tokenA: string;
            tokenB: string;
            amountIn: number;
            dexId: "ZERO_G";
            tokenPrice: number;
            feeRate: number;
            routePlan: {
                aToB: boolean;
                tokenA: string;
                tokenB: string;
                dexId: "ZERO_G";
                poolAddress: string;
                fee: number;
            }[];
            dexFactory: string;
        }, {
            amountOut: string;
            tokenA: string;
            tokenB: string;
            amountIn: string;
            dexId: "ZERO_G";
            tokenPrice: string;
            feeRate: string;
            routePlan: {
                aToB: boolean;
                tokenA: string;
                tokenB: string;
                dexId: "ZERO_G";
                poolAddress: string;
                fee: number;
            }[];
            dexFactory: string;
        }>;
        slippage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        publicKey: string;
        quote: {
            amountOut: number;
            tokenA: string;
            tokenB: string;
            amountIn: number;
            dexId: "ZERO_G";
            tokenPrice: number;
            feeRate: number;
            routePlan: {
                aToB: boolean;
                tokenA: string;
                tokenB: string;
                dexId: "ZERO_G";
                poolAddress: string;
                fee: number;
            }[];
            dexFactory: string;
        };
        slippage: number;
    }, {
        publicKey: string;
        quote: {
            amountOut: string;
            tokenA: string;
            tokenB: string;
            amountIn: string;
            dexId: "ZERO_G";
            tokenPrice: string;
            feeRate: string;
            routePlan: {
                aToB: boolean;
                tokenA: string;
                tokenB: string;
                dexId: "ZERO_G";
                poolAddress: string;
                fee: number;
            }[];
            dexFactory: string;
        };
        slippage: number;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        publicKey: string;
        quote: {
            amountOut: number;
            tokenA: string;
            tokenB: string;
            amountIn: number;
            dexId: "ZERO_G";
            tokenPrice: number;
            feeRate: number;
            routePlan: {
                aToB: boolean;
                tokenA: string;
                tokenB: string;
                dexId: "ZERO_G";
                poolAddress: string;
                fee: number;
            }[];
            dexFactory: string;
        };
        slippage: number;
    };
}, {
    body: {
        publicKey: string;
        quote: {
            amountOut: string;
            tokenA: string;
            tokenB: string;
            amountIn: string;
            dexId: "ZERO_G";
            tokenPrice: string;
            feeRate: string;
            routePlan: {
                aToB: boolean;
                tokenA: string;
                tokenB: string;
                dexId: "ZERO_G";
                poolAddress: string;
                fee: number;
            }[];
            dexFactory: string;
        };
        slippage: number;
    };
}>;
export type SwapRequestType = z.infer<typeof SwapRequestSchema>["body"];
