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
const swapQuoteService = async (params, provider) => {
    try {
        console.log("Processing swap transaction request", {
            ...params
        });
        const { routes, bestOutcome, RouteJsonRpcProvider } = await (0, index_1.getBestRoutes)(index_1.DEX_IDS.ZERO_G, params.tokenA, params.tokenB, (params.amountIn), provider, {
            targetRouteNumber: 5,
        });
        const isNativeIn = params.tokenA.toLowerCase() === RouteJsonRpcProvider.getDexConfig().nativeTokenAddress.toLowerCase();
        const isNativeOut = params.tokenB.toLowerCase() === RouteJsonRpcProvider.getDexConfig().nativeTokenAddress.toLowerCase();
        console.log('routes: ', routes);
        const { amountOut } = await RouteJsonRpcProvider.getAmountOutFromPlan(new decimal_js_1.default(params.amountIn), routes, 0, provider);
        // Get token price
        let tokenPrice = new decimal_js_1.default(0);
        try {
            const p = await RouteJsonRpcProvider.calculateRoutePrice(routes);
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
        if (error instanceof errors_api_1.ApiError) {
            throw error;
        }
        throw new errors_api_1.ApiError(500, "Failed to process swap quote");
    }
};
exports.swapQuoteService = swapQuoteService;
const swapService = async (params, provider) => {
    try {
        // Calculate fee rate
        let defaultFeeRate = constants_1.DESERIALIZE_FEE; // Default fee rate
        defaultFeeRate =
            (0, utils_1.getSwapRequestFeeRate)(params.quote.tokenA, params.quote.tokenB)?.feeRate ?? defaultFeeRate;
        const cache = await (0, index_1.initAndGetCache)();
        //TODO: hot fix for the fact that i only have one dex id 
        const dexId = index_1.DEX_IDS.ZERO_G;
        const RouteJsonRpcProvider = new ((0, index_1.getRouteJsonRpcProvider)(dexId))(provider, cache);
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
const tokenList = async (provider) => {
    const router = (0, index_1.getRouteJsonRpcProvider)(index_1.DEX_IDS.ZERO_G);
    const cache = await (0, index_1.initAndGetCache)();
    const routeInstance = new router(provider, cache);
    return await routeInstance.listTokens();
};
exports.tokenList = tokenList;
const tokenListWithDetailsService = async (provider) => {
    const router = (0, index_1.getRouteJsonRpcProvider)(index_1.DEX_IDS.ZERO_G);
    const cache = await (0, index_1.initAndGetCache)();
    const routeInstance = new router(provider, cache);
    const calculator = new routes_providers_1.UniswapV3QuoteCalculator(routes_providers_1.ZeroGRoute.config, provider);
    const tokens = await routeInstance.listTokens();
    const detailedTokens = await Promise.all(tokens.map(async (token) => {
        const cacheDetails = await cache.getMintFromCache("ALL", token);
        if (!cacheDetails) {
            const details = await calculator.getTokenDetails(token);
            await cache.setMintToCache("ALL", { ...details, contractAddress: token });
            return details;
        }
        return cacheDetails;
    }));
    return detailedTokens;
};
exports.tokenListWithDetailsService = tokenListWithDetailsService;
const getTokenPriceService = async (tokenAddress, provider) => {
    const calculator = new routes_providers_1.UniswapV3QuoteCalculator(routes_providers_1.ZeroGRoute.config, provider);
    // return calculator.getPoolData("0x224D0891D63Ca83e6DD98B4653C27034503a5E76")
    return await calculator.getSureTokenPrice(tokenAddress);
};
exports.getTokenPriceService = getTokenPriceService;
const getTokenDetailsService = async (tokenAddress, provider) => {
    const calculator = new routes_providers_1.UniswapV3QuoteCalculator(routes_providers_1.ZeroGRoute.config, provider);
    const cache = await (0, index_1.initAndGetCache)();
    const cacheDetails = await cache.getMintFromCache("ALL", tokenAddress);
    if (!cacheDetails) {
        const details = await calculator.getTokenDetails(tokenAddress);
        await cache.setMintToCache("ALL", { ...details, contractAddress: tokenAddress });
        return details;
    }
    return cacheDetails;
};
exports.getTokenDetailsService = getTokenDetailsService;
