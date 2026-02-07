"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenDetailsService = exports.getTokenPriceService = exports.tokenListWithDetailsService = exports.tokenList = exports.swapService = exports.swapQuoteService = void 0;
const index_1 = require("../index");
const decimal_js_1 = __importDefault(require("decimal.js"));
const errors_api_1 = require("../errors/errors.api");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const routes_providers_1 = require("@deserialize-evm-agg/routes-providers");
const swapQuoteService = async (params, provider, network) => {
    try {
        console.log("Processing swap transaction request", {
            ...params
        });
        const { routes, bestOutcome, RouteJsonRpcProvider } = await (0, index_1.getBestRoutes)(
        //TODO: THIS IS FOR BACKWARD COMPATIBILITY, REMOVE LATER
        network, params.tokenA, params.tokenB, (params.amountIn), provider, {
            targetRouteNumber: 5,
        });
        const isNativeIn = params.tokenA.toLowerCase() === RouteJsonRpcProvider.getDexConfig().nativeTokenAddress.toLowerCase();
        const isNativeOut = params.tokenB.toLowerCase() === RouteJsonRpcProvider.getDexConfig().nativeTokenAddress.toLowerCase();
        console.log('routes: ', routes);
        const { amountOut, pools } = await RouteJsonRpcProvider.getAmountOutFromPlan(new decimal_js_1.default(params.amountIn), routes, 0, provider);
        // Get token price
        let tokenPrice = new decimal_js_1.default(0);
        const finalRoutes = routes.map((r, i) => {
            return {
                ...r,
                poolAddress: pools[i]
            };
        });
        try {
            const p = await RouteJsonRpcProvider.calculateRoutePrice(finalRoutes);
            tokenPrice = new decimal_js_1.default(p);
        }
        catch (error) {
        }
        const dexConfig = RouteJsonRpcProvider.getDexConfig();
        return {
            tokenA: params.tokenA,
            tokenB: params.tokenB,
            amountIn: params.amountIn.toString(),
            amountOut: amountOut,
            tokenPrice: tokenPrice.toString(),
            // priceImpact: priceImpact.toFixed(2),
            // priceImpactInUsd: priceImpactInUsd,
            // feeRate: feeRate.toString(),
            routePlan: finalRoutes,
            dexId: params.dexId,
            dexFactory: dexConfig.factoryAddress,
            isNativeIn,
            isNativeOut
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
const swapService = async (params, provider, network) => {
    try {
        // Calculate fee rate
        let defaultFeeRate = constants_1.DESERIALIZE_FEE; // Default fee rate
        defaultFeeRate =
            (0, utils_1.getSwapRequestFeeRate)(params.quote.tokenA, params.quote.tokenB)?.feeRate ?? defaultFeeRate;
        const cache = await (0, index_1.initAndGetCache)();
        // const RouteJsonRpcProvider = new (getRouteJsonRpcProvider(params.quote.dexId))(provider, cache);
        const RouteJsonRpcProvider = new ((0, routes_providers_1.getChainAllRoute)(network))(provider, cache); //TODO: THIS IS FOR BACKWARD COMPATIBILITY, REMOVE LATER
        // console.log("RouteProvider: ", RouteProvider);
        const transaction = await RouteJsonRpcProvider.getTransactionInstructionFromRoutePlan(new decimal_js_1.default(params.quote.amountIn), params.quote.routePlan, params.publicKey, params.slippage, params.quote.isNativeIn, params.quote.isNativeOut, params.partnerFees);
        return {
            transaction
        };
    }
    catch (error) {
        console.log("Error in swapService", { error, params });
        if (error instanceof errors_api_1.ApiError) {
            throw error;
        }
        throw new errors_api_1.ApiError(500, "Failed to process swap");
    }
};
exports.swapService = swapService;
const tokenList = async (provider, network) => {
    const router = (0, routes_providers_1.getChainAllRoute)(network ?? "0G");
    const cache = await (0, index_1.initAndGetCache)();
    const routeInstance = new router(provider, cache);
    return await routeInstance.listTokens();
};
exports.tokenList = tokenList;
const tokenListWithDetailsService = async (provider, network) => {
    const router = (0, routes_providers_1.getChainAllRoute)(network);
    const cache = await (0, index_1.initAndGetCache)();
    const routeInstance = new router(provider, cache);
    const tokens = await routeInstance.listTokens();
    const detailedTokens = await Promise.all(tokens.map(async (token) => {
        try {
            const cacheDetails = await cache.getMintFromCache(`ALL_${network}`, token);
            if (!cacheDetails) {
                const details = await (0, routes_providers_1.getTokenDetails)(token, provider);
                await cache.setMintToCache(`ALL_${network}`, { ...details, contractAddress: token });
                return details;
            }
            return cacheDetails;
        }
        catch (error) {
            console.log("Error in tokenListWithDetailsService", { error });
            return null;
        }
    }));
    return detailedTokens.filter((token) => token !== null);
};
exports.tokenListWithDetailsService = tokenListWithDetailsService;
const getTokenPriceService = async (tokenAddress, provider, network) => {
    const router = (0, routes_providers_1.getChainAllRoute)(network);
    const cache = await (0, index_1.initAndGetCache)();
    const routeInstance = new router(provider, cache);
    // return calculator.getPoolData("0x224D0891D63Ca83e6DD98B4653C27034503a5E76")
    return await routeInstance.getSurePriceOfToken(tokenAddress);
};
exports.getTokenPriceService = getTokenPriceService;
const getTokenDetailsService = async (tokenAddress, provider, network) => {
    const router = (0, routes_providers_1.getChainAllRoute)(network);
    const cache = await (0, index_1.initAndGetCache)();
    const routeInstance = new router(provider, cache);
    const cacheDetails = await cache.getMintFromCache(`ALL_${network}`, tokenAddress);
    if (!cacheDetails) {
        const details = await (0, routes_providers_1.getTokenDetails)(tokenAddress, provider);
        await cache.setMintToCache(`ALL_${network}`, { ...details, contractAddress: tokenAddress });
        return details;
    }
    return cacheDetails;
};
exports.getTokenDetailsService = getTokenDetailsService;
