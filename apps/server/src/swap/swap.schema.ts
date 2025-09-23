import exp from "constants";
import { DEX_IDS, dexIdList } from "../index";
import { z } from "zod";

export const SwapQuoteRequestSchema = z.object({
    body: z.object({
        tokenA: z.string(),
        tokenB: z.string(),
        amountIn: z.string().transform((arg) => {
            return parseFloat(arg);
        }),
        dexId: z.enum(
            [
                DEX_IDS.ZERO_G
            ]
        ),
        options: z
            .object({
                targetRouteNumber: z.number(),
            })
            .optional(),
    }),
});


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
                    dexId: z.enum(
                        [
                            DEX_IDS.ZERO_G
                        ]
                    ),
                })
            ),
            // dexFactory: z.string(),

            dexId: z.enum(
                [
                    DEX_IDS.ALL
                ]
            ),
        }),
        slippage: z.number(),
    }),
});

export type SwapRequestType = z.infer<typeof SwapRequestSchema>["body"]


export const TokenPriceRequestSchema = z.object({
    params: z.object({
        tokenAddress: z.string(),
    }),
});

export type TokenPriceRequestType = z.infer<typeof TokenPriceRequestSchema>["params"]
