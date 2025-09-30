"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformRoutePlanToIPath = void 0;
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
