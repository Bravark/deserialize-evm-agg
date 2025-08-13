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


export type SwapQuoteRequestType = z.infer<typeof SwapQuoteRequestSchema>;

