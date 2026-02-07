"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenDetailsRequestSchema = exports.TokenPriceRequestSchema = exports.SwapRequestSchema = exports.SwapQuoteRequestSchema = void 0;
const zod_1 = require("zod");
exports.SwapQuoteRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        tokenA: zod_1.z.string(),
        tokenB: zod_1.z.string(),
        amountIn: zod_1.z.string().transform((arg) => {
            return parseFloat(arg);
        }),
        dexId: zod_1.z.string(),
        options: zod_1.z
            .object({
            targetRouteNumber: zod_1.z.number(),
        })
            .optional(),
    }),
    params: zod_1.z.object({
        chain: zod_1.z.string().default("0G"),
    }).optional(),
});
exports.SwapRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        publicKey: zod_1.z.string(),
        quote: zod_1.z.object({
            tokenA: zod_1.z.string(),
            tokenB: zod_1.z.string(),
            amountIn: zod_1.z.string().transform((arg) => {
                return parseFloat(arg);
            }),
            amountOut: zod_1.z.string().transform((arg) => {
                return parseFloat(arg);
            }),
            tokenPrice: zod_1.z.string().transform((arg) => {
                return parseFloat(arg);
            }),
            feeRate: zod_1.z.string().transform((arg) => {
                return parseFloat(arg);
            }).optional(),
            routePlan: zod_1.z.array(zod_1.z.object({
                tokenA: zod_1.z.string(),
                tokenB: zod_1.z.string(),
                poolAddress: zod_1.z.string(),
                fee: zod_1.z.number(),
                aToB: zod_1.z.boolean(),
                dexId: zod_1.z.string(),
            })),
            // dexFactory: z.string(),
            dexId: zod_1.z.string(),
            isNativeIn: zod_1.z.boolean(),
            isNativeOut: zod_1.z.boolean(),
        }),
        slippage: zod_1.z.number().transform((arg) => {
            if (arg < 0 || arg > 10) {
                throw new Error("Slippage must be between 0 and 10");
            }
            return arg;
        }),
        partnerFees: zod_1.z.object({
            recipient: zod_1.z.string(),
            fee: zod_1.z.number().min(0),
        }).optional()
    }),
    params: zod_1.z.object({
        chain: zod_1.z.string().default("0G"),
    }).optional(),
});
exports.TokenPriceRequestSchema = zod_1.z.object({
    params: zod_1.z.object({
        tokenAddress: zod_1.z.string(),
        chain: zod_1.z.string().optional().default("0G"),
    }),
});
exports.TokenDetailsRequestSchema = zod_1.z.object({
    params: zod_1.z.object({
        tokenAddress: zod_1.z.string(),
        chain: zod_1.z.string().optional().default("0G"),
    }),
});
