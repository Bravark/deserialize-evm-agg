import { DEX_IDS, ZeroGRoute } from "@deserialize-evm-agg/routes-providers"
import Decimal from "decimal.js"
import { JsonRpcProvider, JsonRpcSigner } from "ethers"
import { getBestRoutes } from "./src/index"

const userInput = {
    tokenIn: "0x36f6414FF1df609214dDAbA71c84f18bcf00F67d",//BTC
    tokenOut: "0x0fE9B43625fA7EdD663aDcEC0728DD635e4AbF7c", //ETH
    amountIn: "1000000000000000000", // 100,000 usdc
    slippage: 0.1, // 0.5% slippage
    wallet: "0x3766c4a45e7a73874dbcaa51b1d73627cb9b9c1b"
}

const chain = {
    name: "0g",
    rpc: "https://evmrpc-testnet.0g.ai"
}

const testSwap = async () => {


    console.log("test")
    const provider = new JsonRpcProvider(chain.rpc)
    const { routes, bestOutcome, RouteJsonRpcProvider } = await getBestRoutes(
        DEX_IDS.ZERO_G,
        userInput.tokenIn,
        userInput.tokenOut,
        parseFloat(userInput.amountIn),
        provider,
        {
            targetRouteNumber: 5,
        })

    console.log('routes: ', routes);

    const { amountOut } =
        await RouteJsonRpcProvider.getAmountOutFromPlan(
            new Decimal(userInput.amountIn),
            routes,
            0,
            provider

        );
    console.log('amountOut: ', amountOut);

    const transaction = await RouteJsonRpcProvider.getTransactionInstructionFromRoutePlan(
        new Decimal(userInput.amountIn),
        routes,
        userInput.wallet,
        userInput.slippage,
        false,
        false
    );
    console.log('transaction: ', transaction);
}


