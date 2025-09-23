import { JsonRpcProvider } from "ethers";
import { SwapQuoteRequestType, SwapRequestType } from "./swap.schema";
import { DEX_IDS, getBestRoutes, getRouteJsonRpcProvider, initAndGetCache } from "../index";
import Decimal from "decimal.js";
import { ApiError } from "../errors/errors.api";
import { DESERIALIZE_FEE } from "../constants";
import { getSwapRequestFeeRate } from "../utils";


export const swapQuoteService = async (params: SwapQuoteRequestType, provider: JsonRpcProvider) => {

    try {
        console.log("Processing swap transaction request", {
            ...params
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
        let tokenPrice = new Decimal(0);
        try {

            const p = await RouteJsonRpcProvider.calculateRoutePrice(routes);
            tokenPrice = new Decimal(p)
        } catch (error) {

        }

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

export const swapService = async (params: SwapRequestType, provider: JsonRpcProvider) => {
    try {
        // Calculate fee rate
        let defaultFeeRate = DESERIALIZE_FEE // Default fee rate
        defaultFeeRate =
            getSwapRequestFeeRate(
                params.quote.tokenA,
                params.quote.tokenB
            )?.feeRate ?? defaultFeeRate;


        const cache = await initAndGetCache()

        //TODO: hot fix for the fact that i only have one dex id 
        const dexId = DEX_IDS.ZERO_G
        const RouteJsonRpcProvider = new (getRouteJsonRpcProvider(dexId))(provider, cache);
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




export const tokenList = async (provider: JsonRpcProvider) => {
    const router = getRouteJsonRpcProvider(DEX_IDS.ZERO_G)
    const cache = await initAndGetCache()
    const routeInstance = new router(provider, cache)
    return routeInstance.listTokens()
}
