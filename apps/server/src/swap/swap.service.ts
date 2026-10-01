import { JsonRpcProvider } from "ethers";
import { SwapQuoteRequestType, SwapRequestType } from "./swap.schema";
import { getBestRoutes, initAndGetCache } from "../index";
import Decimal from "decimal.js";
import { ApiError } from "../errors/errors.api";
import { DESERIALIZE_FEE } from "../constants";
import { getSwapRequestFeeRate } from "../utils";
import { AllDexIdTypes, getChainAllRoute, getTokenDetails, UniswapV3QuoteCalculator, ZeroGRoute } from "@deserialize-evm-agg/routes-providers";
import { NetworkType } from "@deserialize-evm-agg/routes-providers";




export const swapQuoteService = async (params: SwapQuoteRequestType, provider: JsonRpcProvider, network: NetworkType) => {

    try {
        console.log(`    [QUOTE_SVC:1/5] Initiating route search: Network=${network}, Pair=${params.tokenA} -> ${params.tokenB}, Amount=${params.amountIn}`);

        const { routes, bestOutcome, RouteJsonRpcProvider } = await getBestRoutes(
            network,
            params.tokenA,
            params.tokenB,
            (params.amountIn),
            provider,
            {
                targetRouteNumber: 5,
            });

        const isNativeIn = params.tokenA.toLowerCase() === RouteJsonRpcProvider.getDexConfig().nativeTokenAddress.toLowerCase();
        const isNativeOut = params.tokenB.toLowerCase() === RouteJsonRpcProvider.getDexConfig().nativeTokenAddress.toLowerCase();
        console.log(`    [QUOTE_SVC:2/5] Best routes retrieved (${routes.length} hop(s)):`, routes.map(r => `${r.dexId} (${r.tokenA.slice(0, 8)}... -> ${r.tokenB.slice(0, 8)}...) via pool ${r.poolAddress}`));

        console.log(`    [QUOTE_SVC:3/5] Simulating on-chain amountOut from route plan...`);
        const { amountOut, pools } =
            await RouteJsonRpcProvider.getAmountOutFromPlan(
                new Decimal(params.amountIn),
                routes,
                0,
                provider
            );
        console.log(`    [QUOTE_SVC:4/5] amountOut result: ${amountOut.toString()}`);

        // Get token price
        let tokenPrice = new Decimal(0);

        const finalRoutes = routes.map((r, i) => {
            return {
                ...r,
                poolAddress: pools[i]
            }
        });

        try {
            const p = await RouteJsonRpcProvider.calculateRoutePrice(finalRoutes);
            tokenPrice = new Decimal(p);
            console.log(`    [QUOTE_SVC:5/5] Token route price calculated: ${tokenPrice.toString()}`);
        } catch (error: any) {
            console.warn(`    [QUOTE_SVC:5/5] Route price lookup fallback (non-fatal):`, error?.message);
        }

        const dexConfig = RouteJsonRpcProvider.getDexConfig();
        return {
            tokenA: params.tokenA,
            tokenB: params.tokenB,
            amountIn: params.amountIn.toString(),
            amountOut: amountOut,
            tokenPrice: tokenPrice.toString(),
            routePlan: finalRoutes,
            dexId: params.dexId,
            dexFactory: dexConfig.factoryAddress,
            isNativeIn,
            isNativeOut
        };
    }
    catch (error: any) {
        console.error("❌ [QUOTE_SVC:ERROR] swapQuoteService failed:", {
            pair: `${params.tokenA} -> ${params.tokenB}`,
            amountIn: params.amountIn,
            network,
            message: error?.message,
            stack: error?.stack,
        });
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, `Failed to process swap quote: ${error?.message || "Unknown error"}`);
    }

}

export const swapService = async (params: SwapRequestType, provider: JsonRpcProvider, network: NetworkType) => {
    try {
        console.log(`    [SWAP_SVC:1/4] Preparing swap for wallet=${params.publicKey} on network=${network}, slippage=${params.slippage}%`);

        let defaultFeeRate = DESERIALIZE_FEE;
        defaultFeeRate =
            getSwapRequestFeeRate(
                params.quote.tokenA,
                params.quote.tokenB
            )?.feeRate ?? defaultFeeRate;

        const cache = await initAndGetCache();
        console.log(`    [SWAP_SVC:2/4] Initialized route provider for ${network}...`);
        const RouteJsonRpcProvider = new (getChainAllRoute(network))(provider, cache);

        console.log(`    [SWAP_SVC:3/4] Requesting transaction instructions for ${params.quote.routePlan?.length || 0} hop(s)...`);
        const transaction = await RouteJsonRpcProvider.getTransactionInstructionFromRoutePlan(
            new Decimal(params.quote.amountIn),
            params.quote.routePlan,
            params.publicKey,
            params.slippage,
            params.quote.isNativeIn,
            params.quote.isNativeOut,
            params.partnerFees
        );

        console.log(`    [SWAP_SVC:4/4] Successfully constructed ${transaction.transactions.length} transaction payload(s)`);

        return {
            transaction
        };
    } catch (error: any) {
        console.error("❌ [SWAP_SVC:ERROR] swapService failed:", {
            wallet: params.publicKey,
            network,
            message: error?.message,
            stack: error?.stack,
        });
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, `Failed to process swap: ${error?.message || "Unknown error"}`);
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


