import { JsonRpcProvider } from "ethers";
import { SwapQuoteRequestType, SwapRequestType } from "./swap.schema";
import { DEX_IDS, getBestRoutes, getRouteJsonRpcProvider, initAndGetCache } from "../index";
import Decimal from "decimal.js";
import { ApiError } from "../errors/errors.api";
import { DESERIALIZE_FEE } from "../constants";
import { getSwapRequestFeeRate } from "../utils";

const chain = {
    name: "0g",
    rpc: "https://evmrpc-testnet.0g.ai"
}

const provider = new JsonRpcProvider(chain.rpc)
export const swapQuoteService = async (params: SwapQuoteRequestType) => {

    try {
        console.log("Processing swap quote request", {
            tokenA: params.tokenA.toString(),
            tokenB: params.tokenB.toString(),
            amountIn: params.amountIn,
        });

        const { routes, bestOutcome, RouteJsonRpcProvider } = await getBestRoutes(
            DEX_IDS.ZERO_G,
            params.tokenA,
            params.tokenB,
            (params.amountIn),
            provider,
            {
                targetRouteNumber: 5,
            })

        console.log('routes: ', routes);

        const { amountOut } =
            await RouteJsonRpcProvider.getAmountOutFromPlan(
                new Decimal(params.amountIn),
                routes,
                0,
                provider

            );
        // Get token price
        const tokenPrice = await RouteJsonRpcProvider.calculateRoutePrice(routes);

        const dexConfig = RouteJsonRpcProvider.getDexConfig()
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
            dexFactory: dexConfig.factoryAddress
        };
    }
    catch (error) {
        console.log("Error in swapQuoteService", { error });
        console.log("error: ", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Failed to process swap quote");
    }

}

export const swapService = async (params: SwapRequestType) => {
    try {
        // Calculate fee rate
        let defaultFeeRate = DESERIALIZE_FEE // Default fee rate
        defaultFeeRate =
            getSwapRequestFeeRate(
                params.quote.tokenA,
                params.quote.tokenB
            )?.feeRate ?? defaultFeeRate;


        const cache = await initAndGetCache()
        const RouteJsonRpcProvider = new (getRouteJsonRpcProvider(params.quote.dexId))(provider, cache);
        // console.log("RouteProvider: ", RouteProvider);

        const transaction = await RouteJsonRpcProvider.getTransactionInstructionFromRoutePlan(
            new Decimal(params.quote.amountIn),
            params.quote.routePlan,
            params.publicKey,
            params.slippage,
        );




        return {
            transaction
        };
    } catch (error) {
        console.log("Error in swapService", { error, params });
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Failed to process swap");
    }
};





