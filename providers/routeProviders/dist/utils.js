"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformRoutePlanToIPath = void 0;
const transformRoutePlanToIPath = (factoryAddress, routePlan) => {
    const plan = [];
    for (const route of routePlan) {
        const path = {
            factory: factoryAddress, // Assuming factory is always ZERO_G for this example
            poolAddress: route.poolAddress,
            tokenIn: route.aToB ? route.tokenA : route.tokenB,
            tokenOut: route.aToB ? route.tokenB : route.tokenA,
            fee: route.fee,
        };
        plan.push(path);
    }
    return plan;
};
exports.transformRoutePlanToIPath = transformRoutePlanToIPath;
