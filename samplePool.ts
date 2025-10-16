import { PANCAKE_BASE_CONFIG, UNISWAP_V3_BASE_CONFIG, UniswapV3QuoteCalculator } from "@deserialize-evm-agg/routes-providers";
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
export async function exampleUsage() {
    // Initialize calculator with default Base configuration
    // const calculator = new AerodromeV3QuoteCalculator(AERODROME_BASE_CONFIG, chain);
    const calculator = new PancakeSwapV3Calculator(PANCAKE_BASE_CONFIG, chain);

    // Example: Get quote for swapping 1 ETH to USDC
    const WETH = "0x4200000000000000000000000000000000000006";
    const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

    try {
        //simulate transaction 
        const simulation = await calculator.simulateTransaction("0xdd2027fca129005b6255295ceb7e281365e50b0e", "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", "3972159287693577302315", 100)
        console.log("Simulation Result:", simulation);

        const quote = await calculator.getQuote({
            tokenIn: "0xdd2027fca129005b6255295ceb7e281365e50b0e",
            tokenOut: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
            amountIn: 3972159287693577302315, // 1 WETH
        });

        console.log("Quote Result:", {
            amountIn: quote.amountIn.toString(),
            amountOut: quote.amountOut.toString(),
            price: quote.price,
            poolAddress: quote.poolAddress,
            fee: quote.fee.toString(),
        });


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