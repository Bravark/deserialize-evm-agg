import { BaseChain, PANCAKE_BASE_CONFIG, UNISWAP_V3_BASE_CONFIG, UniswapV3QuoteCalculator } from "@deserialize-evm-agg/routes-providers";
import { AerodromeV3QuoteCalculator } from "@deserialize-evm-agg/routes-providers/Aerodromev3Calculator";
import { AERODROME_BASE_CONFIG } from "@deserialize-evm-agg/routes-providers/base/aerodrome";
import { chain } from "@deserialize-evm-agg/routes-providers/base/chain";
import { UniswapV3BaseRoute } from "@deserialize-evm-agg/routes-providers/base/uniswap";
import { PancakeSwapV3Calculator } from "@deserialize-evm-agg/routes-providers/PancakeSwapV3Calculator";
import { UNISWAP_V3_QUOTER_V2_ABI, UniswapV3QuoteCalculatorV2 } from "@deserialize-evm-agg/routes-providers/UniswapV3CalculatorV2";
import { v3PoolAbi } from "@deserialize-evm-agg/routes-providers/v3FactoryAbi";

/**
 * Example usage of AerodromeV3QuoteCalculator
 */


[
    {
        tokenA: '0x4200000000000000000000000000000000000006',
        tokenB: '0x6f8c1de07c9e59a8289705b1033af383dc3681b1',
        dexId: 'AERODROME_V3_BASE',
        poolAddress: '0x7073D6EC6a3CAECFF085854730A62b83CcD79b57',
        aToB: true,
        fee: 100
    },
    {
        tokenA: '0x6f8c1de07c9e59a8289705b1033af383dc3681b1',
        tokenB: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        dexId: 'AERODROME_V3_BASE',
        poolAddress: '0x969C33adDBEdacB3a004A9d81b1822022e328128',
        aToB: true,
        fee: 100
    },
    {
        tokenA: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        tokenB: '0x42081cf59a145ca4ca51edcee577fc4be3b35dbd',
        dexId: 'PANCAKE_V3_BASE',
        poolAddress: '0x79aDafCBb76D96208B7Df237952E2b87a57d2Fb5',
        aToB: false,
        fee: 2500
    }
]


export async function exampleUsage() {
    // Initialize calculator with default Base configuration
    const calculator = new AerodromeV3QuoteCalculator(AERODROME_BASE_CONFIG, chain);
    // const calculator = new PancakeSwapV3Calculator(PANCAKE_BASE_CONFIG, chain);
    // const calculator = new UniswapV3QuoteCalculatorV2(UNISWAP_V3_BASE_CONFIG, BaseChain);

    // Example: Get quote for swapping 1 ETH to USDC
    const WETH = "0x4200000000000000000000000000000000000006";
    const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

    const tokenA = "0x4200000000000000000000000000000000000006";
    const tokenB = "0x6f8c1de07c9e59a8289705b1033af383dc3681b1"
    const amount = "292300000000000000"

    try {
        //simulate transaction 

        // return

        const quote = await calculator.getQuote({
            tokenIn: tokenA,
            tokenOut: tokenB,
            amountIn: Number(amount),

        });

        console.log("Quote Result:", {
            amountIn: quote.amountIn.toString(),
            amountOut: quote.amountOut.toString(),
            price: quote.price,
            poolAddress: quote.poolAddress,
            fee: quote.fee.toString(),
        });
        const simulation = await calculator.simulateTransaction(tokenA, tokenB, amount, quote.poolAddress)
        console.log("Simulation Result:", simulation);


        // // Get token price
        // const ethPrice = await calculator.getSureTokenPrice(WETH);
        // console.log("ETH Price:", ethPrice);

        // Find all pools (this might take a while)
        // const allPools = await calculator.getAllPools();
        // console.log(`Found ${allPools.length} pools`);

    } catch (error) {
        console.error("Error:", error);
    }
}
exampleUsage()