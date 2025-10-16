import { getChainDexIds, } from "@deserialize-evm-agg/routes-providers";
import exp from "constants";
import { chain } from "lodash";

import { object, z } from "zod";

export const SwapQuoteRequestSchema = z.object({
    body: z.object({
        tokenA: z.string(),
        tokenB: z.string(),
        amountIn: z.string().transform((arg) => {
            return parseFloat(arg);
        }),
        dexId: z.string(),
        options: z
            .object({
                targetRouteNumber: z.number(),
            })
            .optional(),
    }),
    params: z.object({
        chain: z.string().default("0G"),
    }).optional(),
});

//
export type SwapQuoteRequestType = z.infer<typeof SwapQuoteRequestSchema>["body"]

export const SwapRequestSchema = z.object({
    body: z.object({
        publicKey: z.string(),
        quote: z.object({
            tokenA: z.string(),
            tokenB: z.string(),
            amountIn: z.string().transform((arg) => {
                return parseFloat(arg);
            }),
            amountOut: z.string().transform((arg) => {
                return parseFloat(arg);
            }),
            tokenPrice: z.string().transform((arg) => {
                return parseFloat(arg);
            }),
            feeRate: z.string().transform((arg) => {
                return parseFloat(arg);
            }).optional(),
            routePlan: z.array(
                z.object({
                    tokenA: z.string(),
                    tokenB: z.string(),
                    poolAddress: z.string(),
                    fee: z.number(),
                    aToB: z.boolean(),
                    dexId: z.string(),
                })
            ),
            // dexFactory: z.string(),

            dexId: z.string(),
            isNativeIn: z.boolean(),
            isNativeOut: z.boolean(),
        }),
        slippage: z.number().transform((arg) => {
            if (arg < 0 || arg > 10) {
                throw new Error("Slippage must be between 0 and 10");
            }
            return arg;
        }),
        partnerFees: z.object({
            recipient: z.string(),
            fee: z.number().min(0),
        }).optional()
    }),
    params: z.object({
        chain: z.string().default("0G"),
    }).optional(),
});

export type SwapRequestType = z.infer<typeof SwapRequestSchema>["body"]


export const TokenPriceRequestSchema = z.object({
    params: z.object({
        tokenAddress: z.string(),
        chain: z.string().optional().default("0G"),
    }),
});

export type TokenPriceRequestType = z.infer<typeof TokenPriceRequestSchema>["params"]


export const TokenDetailsRequestSchema = z.object({
    params: z.object({
        tokenAddress: z.string(),
        chain: z.string().optional().default("0G"),
    }),
});

export type TokenDetailsRequestType = z.infer<typeof TokenDetailsRequestSchema>["params"]
