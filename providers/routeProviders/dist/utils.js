"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenDetails = exports.transformRoutePlanToIPath = void 0;
const ethers_1 = require("ethers");
const UniswapV3Calculator_1 = require("./UniswapV3Calculator");
const transformRoutePlanToIPath = (factoryAddress, routePlan, nativeTokenAddress, warpedTokenAddress, isNativeIn, isNativeOut) => {
    const plan = [];
    for (const route of routePlan) {
        const path = {
            factory: factoryAddress, // Assuming factory is always ZERO_G for this example
            poolAddress: route.poolAddress,
            // tokenIn: route.aToB ? route.tokenA : route.tokenB,
            tokenIn: isNativeIn ? route.tokenA.toLowerCase() === warpedTokenAddress.toLowerCase() ? nativeTokenAddress : route.tokenA : route.tokenA,
            // tokenOut: route.aToB ? route.tokenB : route.tokenA,
            tokenOut: isNativeOut ? route.tokenB.toLowerCase() === warpedTokenAddress.toLowerCase() ? nativeTokenAddress : route.tokenB : route.tokenB,
            fee: route.fee,
        };
        plan.push(path);
    }
    return plan;
};
exports.transformRoutePlanToIPath = transformRoutePlanToIPath;
const getTokenDetails = async (tokenAddress, provider) => {
    const tokenContract = new ethers_1.Contract(tokenAddress, UniswapV3Calculator_1.ERC20_ABI, provider);
    const [decimals, symbol, name] = await Promise.all([
        tokenContract.decimals(),
        tokenContract.symbol(),
        tokenContract.name(),
    ]);
    const tokenDetails = {
        address: tokenAddress,
        decimals: Number(decimals),
        symbol: symbol,
        name: name
    };
    return tokenDetails;
};
exports.getTokenDetails = getTokenDetails;
