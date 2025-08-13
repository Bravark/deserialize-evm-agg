"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapQuoteRequestSchema = void 0;
const index_1 = require("../index");
const zod_1 = require("zod");
exports.SwapQuoteRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        tokenA: zod_1.z.string(),
        tokenB: zod_1.z.string(),
        amountIn: zod_1.z.string().transform((arg) => {
            return parseFloat(arg);
        }),
        dexId: zod_1.z.enum([
            index_1.DEX_IDS.ZERO_G
        ]),
        options: zod_1.z
            .object({
            targetRouteNumber: zod_1.z.number(),
        })
            .optional(),
    }),
}); //
