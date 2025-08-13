"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapQuoteService = void 0;
const ethers_1 = require("ethers");
const index_1 = require("../index");
const decimal_js_1 = __importDefault(require("decimal.js"));
const errors_api_1 = require("../errors/errors.api");
const chain = {
    name: "0g",
    rpc: "https://evmrpc-testnet.0g.ai"
};
const provider = new ethers_1.JsonRpcProvider(chain.rpc);
const swapQuoteService = async (params) => {
    try {
        console.log("Processing swap quote request", {
            tokenA: params.tokenA.toString(),
            tokenB: params.tokenB.toString(),
            amountIn: params.amountIn,
        });
        const { routes, bestOutcome, RouteJsonRpcProvider } = await (0, index_1.getBestRoutes)(index_1.DEX_IDS.ZERO_G, params.tokenA, params.tokenB, (params.amountIn), provider, {
            targetRouteNumber: 5,
        });
        console.log('routes: ', routes);
        const { amountOut } = await RouteJsonRpcProvider.getAmountOutFromPlan(new decimal_js_1.default(params.amountIn), routes, 0, provider);
        // Get token price
        const tokenPrice = await RouteJsonRpcProvider.calculateRoutePrice(routes);
        return {
            tokenA: params.tokenA,
            tokenB: params.tokenB,
            amountIn: params.amountIn.toString(),
            amountOut: amountOut,
            tokenPrice: tokenPrice.toString(),
            // priceImpact: priceImpact.toFixed(2),
            // priceImpactInUsd: priceImpactInUsd,
            // feeRate: feeRate.toString(),
            routePlan: routes,
            dexId: params.dexId,
        };
    }
    catch (error) {
        console.log("Error in swapQuoteService", { error });
        console.log("error: ", error);
        if (error instanceof errors_api_1.ApiError) {
            throw error;
        }
        throw new errors_api_1.ApiError(500, "Failed to process swap quote");
    }
};
exports.swapQuoteService = swapQuoteService;
