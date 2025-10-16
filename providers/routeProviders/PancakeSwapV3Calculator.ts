/**
 * PancakeSwap V3 Quote Calculator
 * Extends UniswapV3QuoteCalculator for PancakeSwap V3 compatibility
 */

import { JsonRpcProvider } from "ethers";
import { UniswapV3QuoteCalculator, DexConfig, PoolData, PoolCreatedEvent, ChainConfig, QuoteParams, QuoteResult } from "./UniswapV3Calculator";
import { NetworkType } from "deserialize-evm-server-sdk";
import { Network } from "./constants";
import Decimal from "decimal.js";
import { BN } from "bn.js";

// ==================== PANCAKESWAP V3 CONSTANTS ====================

const PANCAKESWAP_V3_FEE_TIERS: number[] = [100, 500, 2500, 10000]; // 0.01%, 0.05%, 0.25%, 1%

// ==================== PANCAKESWAP V3 ABIS ====================

export const PANCAKESWAP_V3_FACTORY_ABI = [
    {
        inputs: [
            { internalType: "address", name: "tokenA", type: "address" },
            { internalType: "address", name: "tokenB", type: "address" },
            { internalType: "uint24", name: "fee", type: "uint24" },
        ],
        name: "getPool",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "token0", type: "address" },
            { indexed: true, internalType: "address", name: "token1", type: "address" },
            { indexed: true, internalType: "uint24", name: "fee", type: "uint24" },
            { indexed: false, internalType: "int24", name: "tickSpacing", type: "int24" },
            { indexed: false, internalType: "address", name: "pool", type: "address" },
        ],
        name: "PoolCreated",
        type: "event",
    },
] as const;

export const PANCAKESWAP_V3_POOL_ABI = [
    {
        inputs: [],
        name: "liquidity",
        outputs: [{ internalType: "uint128", name: "", type: "uint128" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "slot0",
        outputs: [
            { internalType: "uint160", name: "sqrtPriceX96", type: "uint160" },
            { internalType: "int24", name: "tick", type: "int24" },
            { internalType: "uint16", name: "observationIndex", type: "uint16" },
            { internalType: "uint16", name: "observationCardinality", type: "uint16" },
            { internalType: "uint16", name: "observationCardinalityNext", type: "uint16" },
            { internalType: "uint32", name: "feeProtocol", type: "uint32" },
            { internalType: "bool", name: "unlocked", type: "bool" },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "token0",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "token1",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "fee",
        outputs: [{ internalType: "uint24", name: "", type: "uint24" }],
        stateMutability: "view",
        type: "function",
    },
] as const;

export const PANCAKESWAP_V3_QUOTER_V2_ABI = [
    {
        inputs: [
            {
                components: [
                    { internalType: "address", name: "tokenIn", type: "address" },
                    { internalType: "address", name: "tokenOut", type: "address" },
                    { internalType: "uint256", name: "amountIn", type: "uint256" },
                    { internalType: "uint24", name: "fee", type: "uint24" },
                    { internalType: "uint160", name: "sqrtPriceLimitX96", type: "uint160" },
                ],
                internalType: "struct IQuoterV2.QuoteExactInputSingleParams",
                name: "params",
                type: "tuple",
            },
        ],
        name: "quoteExactInputSingle",
        outputs: [
            { internalType: "uint256", name: "amountOut", type: "uint256" },
            { internalType: "uint160", name: "sqrtPriceX96After", type: "uint160" },
            { internalType: "uint32", name: "initializedTicksCrossed", type: "uint32" },
            { internalType: "uint256", name: "gasEstimate", type: "uint256" },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
] as const;


// ==================== CHAIN CONFIGURATIONS ====================

export const PANCAKESWAP_V3_CONFIGS: Record<string, DexConfig> = {
    BSC: {
        name: "PancakeSwap V3",
        network: Network.BSC as NetworkType,
        factoryAddress: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
        quoterAddress: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
        wrappedNativeTokenAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
        nativeTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        stableTokenAddress: "0x55d398326f99059fF775485246999027B3197955", // USDT
        fromBlock: "26956207", // PancakeSwap V3 deployment block
        abi: PANCAKESWAP_V3_FACTORY_ABI,
    },
    ETH: {
        name: "PancakeSwap V3",
        network: Network.ETH as NetworkType,
        factoryAddress: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
        quoterAddress: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
        wrappedNativeTokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
        nativeTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        stableTokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
        fromBlock: "16950686",
        abi: PANCAKESWAP_V3_FACTORY_ABI,
    },
    ARBITRUM: {
        name: "PancakeSwap V3",
        network: Network.ARBITRUM as NetworkType,
        factoryAddress: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
        quoterAddress: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
        wrappedNativeTokenAddress: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH
        nativeTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        stableTokenAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT
        fromBlock: "84815698",
        abi: PANCAKESWAP_V3_FACTORY_ABI,
    },
    BASE: {
        name: "PancakeSwap V3",
        network: Network.BASE as NetworkType,
        factoryAddress: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
        quoterAddress: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
        wrappedNativeTokenAddress: "0x4200000000000000000000000000000000000006", // WETH
        nativeTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        stableTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
        fromBlock: "2283190",
        abi: PANCAKESWAP_V3_FACTORY_ABI,
    },
    ZKSYNC: {
        name: "PancakeSwap V3",
        network: Network.ZKSYNC as NetworkType,
        factoryAddress: "0x1BB72E0CbbEA93c08f535fc7856E0338D7F7a8aB",
        quoterAddress: "0x3d146FcE6c1006857750cBe8aF44f76a28041CCc",
        wrappedNativeTokenAddress: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91", // WETH
        nativeTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        stableTokenAddress: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4", // USDC
        fromBlock: "14714015",
        abi: PANCAKESWAP_V3_FACTORY_ABI,
    },
};

// ==================== PANCAKESWAP V3 CALCULATOR CLASS ====================

export class PancakeSwapV3Calculator extends UniswapV3QuoteCalculator {
    constructor(dexConfig: DexConfig, chainConfig: ChainConfig, _provider?: JsonRpcProvider) {
        const provider = _provider || new JsonRpcProvider(chainConfig.rpcUrl);
        super(dexConfig, chainConfig, provider);
    }

    /**
     * Override fee tiers to use PancakeSwap V3's fee structure
     */
    protected getFeeTiers(): number[] {
        return PANCAKESWAP_V3_FEE_TIERS;
    }

    public async getQuote(params: QuoteParams): Promise<QuoteResult> {
        let pool: PoolData;
        let aToB: boolean;
        let amountInDecimal: Decimal;

        if (params.pool) {
            pool = params.pool;
        } else {
            const bestPool = await this.findBestPool(params.tokenIn, params.tokenOut, PANCAKESWAP_V3_FEE_TIERS);
            pool = bestPool.poolData;
        }

        if (params.aToB !== undefined) {
            aToB = params.aToB;
        } else {
            // Determine direction based on token addresses
            aToB = params.tokenIn.toLowerCase() === pool.token0.address.toLowerCase();
        }

        if (params.amountInFormattedInDecimal) {
            amountInDecimal = params.amountInFormattedInDecimal;
        } else {
            amountInDecimal = new Decimal(params.amountIn);
        }

        return this.getAmountOut({ aToB, amountInFormattedInDecimal: amountInDecimal, pool });
    }

    /**
     * Simulate transaction using PancakeSwap V3's QuoterV2
     * Returns extended information including gas estimate and price impact
     */
    public async simulateTransaction(
        tokenIn: string,
        tokenOut: string,
        amountIn: string,
        fee: number,
        sqrtPriceLimitX96: string = "0"
    ): Promise<string> {
        const config = this.getConfig();
        if (!config.quoterAddress) {
            throw new Error("Quoter address not configured for PancakeSwap V3");
        }

        const { Contract } = await import("ethers");
        const quoter = new Contract(
            config.quoterAddress,
            PANCAKESWAP_V3_QUOTER_V2_ABI,
            this.getProvider()
        );

        try {

            const result = await quoter.quoteExactInputSingle.staticCall({
                tokenIn,
                tokenOut,
                amountIn: new Decimal(amountIn).toFixed(),
                fee,
                sqrtPriceLimitX96: sqrtPriceLimitX96 || "0",
            });
            const res = result[0].toString();
            console.log('current amount out: ', res);
            return res

        } catch (error) {
            console.error("PancakeSwap V3 QuoterV2 simulation failed:", error);
            throw error;
        }
    }

    /**
     * Get all PancakeSwap V3 pools with optimized event fetching
     */

    public async getAllPools(abi: any, fromBlock?: string): Promise<PoolData[]> {
        console.log('fromBlock: ', fromBlock);
        // Map events to a more convenient format
        const pools: PoolCreatedEvent[] = await this.getAllPoolsFromEvents(this.config.factoryAddress, this.provider, fromBlock, abi);
        // console.log('pools: ', pools);
        const poolsData: PoolData[] = []
        // TODO: use .map to make it faster, right now we can't because of the rpc rate limit
        let count = 0
        for (const pool of pools) {
            try {
                // Fetch pool data for each created pool
                const poolData = await this.getPoolData(pool.poolAddress);
                console.log('poolData: ', poolData.poolAddress);
                poolData.blockNumber = pool.blockNumber.toString()
                poolsData.push(poolData);
            } catch (error: any) {
                console.log('error: ', error);
                console.error(`Error fetching data for pool ${pool.poolAddress}: ${error.message}`);
            }

            await wait(10)
        }

        // console.log('poolsData: ', poolsData);
        return poolsData // no longer filtering by liquidity
    }

}

// ==================== HELPER FUNCTIONS ====================

/**
 * Create a PancakeSwap V3 calculator instance for a specific network
 */
export function createPancakeSwapV3Calculator(
    network: keyof typeof PANCAKESWAP_V3_CONFIGS,
    chain: ChainConfig
): PancakeSwapV3Calculator {
    const provider = new JsonRpcProvider(chain.rpcUrl);
    const dexConfig = PANCAKESWAP_V3_CONFIGS[network];
    return new PancakeSwapV3Calculator(dexConfig, chain, provider);
}

/**
 * Get available networks for PancakeSwap V3
 */
export function getAvailablePancakeSwapV3Networks(): string[] {
    return Object.keys(PANCAKESWAP_V3_CONFIGS);
}

export const wait = (time = 2) => {
    return new Promise((resolve) => setTimeout(resolve, time * 1000));
};


