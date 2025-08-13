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
export type SwapQuoteRequestType = z.infer<typeof SwapQuoteRequestSchema>;
