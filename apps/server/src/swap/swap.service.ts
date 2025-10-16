import { JsonRpcProvider } from "ethers";
import { SwapQuoteRequestType, SwapRequestType } from "./swap.schema";
import { getBestRoutes, initAndGetCache } from "../index";
import Decimal from "decimal.js";
import { ApiError } from "../errors/errors.api";
import { DESERIALIZE_FEE } from "../constants";
import { getSwapRequestFeeRate } from "../utils";
import { AllDexIdTypes, getChainAllRoute, getTokenDetails, UniswapV3QuoteCalculator, ZeroGRoute } from "@deserialize-evm-agg/routes-providers";
import { NetworkType } from "@deserialize-evm-agg/routes-providers/dist/constants";




export const swapQuoteService = async (params: SwapQuoteRequestType, provider: JsonRpcProvider, network: NetworkType) => {

    try {
        console.log("Processing swap transaction request", {
            ...params
        });

        const { routes, bestOutcome, RouteJsonRpcProvider } = await getBestRoutes(
            //TODO: THIS IS FOR BACKWARD COMPATIBILITY, REMOVE LATER
            network,
            params.tokenA,
            params.tokenB,
            (params.amountIn),
            provider,
            {
                targetRouteNumber: 5,
            })

        const isNativeIn = params.tokenA.toLowerCase() === RouteJsonRpcProvider.getDexConfig().nativeTokenAddress.toLowerCase()
        const isNativeOut = params.tokenB.toLowerCase() === RouteJsonRpcProvider.getDexConfig().nativeTokenAddress.toLowerCase()
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
            dexFactory: dexConfig.factoryAddress,
            isNativeIn,
            isNativeOut
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

export const swapService = async (params: SwapRequestType, provider: JsonRpcProvider, network: NetworkType) => {
    try {
        // Calculate fee rate
        let defaultFeeRate = DESERIALIZE_FEE // Default fee rate
        defaultFeeRate =
            getSwapRequestFeeRate(
                params.quote.tokenA,
                params.quote.tokenB
            )?.feeRate ?? defaultFeeRate;


        const cache = await initAndGetCache()


        // const RouteJsonRpcProvider = new (getRouteJsonRpcProvider(params.quote.dexId))(provider, cache);
        const RouteJsonRpcProvider = new (getChainAllRoute(network))(provider, cache); //TODO: THIS IS FOR BACKWARD COMPATIBILITY, REMOVE LATER
        // console.log("RouteProvider: ", RouteProvider);

        const transaction = await RouteJsonRpcProvider.getTransactionInstructionFromRoutePlan(
            new Decimal(params.quote.amountIn),
            params.quote.routePlan,
            params.publicKey,
            params.slippage,
            params.quote.isNativeIn,
            params.quote.isNativeOut,
            params.partnerFees

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




export const tokenList = async (provider: JsonRpcProvider, network: NetworkType) => {
    const router = getChainAllRoute(network ?? "0G")
    const cache = await initAndGetCache()
    const routeInstance = new router(provider, cache)

    return await routeInstance.listTokens()
}

export const tokenListWithDetailsService = async (provider: JsonRpcProvider, network: NetworkType) => {
    const router = getChainAllRoute(network)
    const cache = await initAndGetCache()
    const routeInstance = new router(provider, cache)

    const tokens = await routeInstance.listTokens()
    const detailedTokens = await Promise.all(tokens.map(async (token) => {
        try {
            const cacheDetails = await cache.getMintFromCache(`ALL_${network}` as AllDexIdTypes, token)

            if (!cacheDetails) {
                const details = await getTokenDetails(token, provider);
                await cache.setMintToCache(`ALL_${network}` as AllDexIdTypes, { ...details, contractAddress: token });
                return details;
            }

            return cacheDetails;
        } catch (error) {
            console.log("Error in tokenListWithDetailsService", { error });
            return null
        }



    }))

    return detailedTokens.filter((token) => token !== null);
}

export const getTokenPriceService = async (tokenAddress: string, provider: JsonRpcProvider, network: NetworkType) => {
    const router = getChainAllRoute(network)
    const cache = await initAndGetCache()
    const routeInstance = new router(provider, cache)

    // return calculator.getPoolData("0x224D0891D63Ca83e6DD98B4653C27034503a5E76")
    return await routeInstance.getSurePriceOfToken(tokenAddress);
}

export const getTokenDetailsService = async (tokenAddress: string, provider: JsonRpcProvider, network: NetworkType) => {
    const router = getChainAllRoute(network)
    const cache = await initAndGetCache()
    const routeInstance = new router(provider, cache)


    const cacheDetails = await cache.getMintFromCache(`ALL_${network}` as AllDexIdTypes, tokenAddress)

    if (!cacheDetails) {
        const details = await getTokenDetails(tokenAddress, provider);
        await cache.setMintToCache(`ALL_${network}` as AllDexIdTypes, { ...details, contractAddress: tokenAddress });
        return details;
    }

    return cacheDetails;
}


