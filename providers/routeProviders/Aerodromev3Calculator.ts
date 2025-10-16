/**
 * Aerodrome V3 Quote Calculator Extension
 * 
 * Extends the UniswapV3QuoteCalculator to support Aerodrome V3 DEX
 * Aerodrome V3 uses Uniswap V3's core logic with some modifications
 */

import { UniswapV3QuoteCalculator, DexConfig, ChainConfig, PoolCreatedEvent } from "./UniswapV3Calculator";
import { Contract, JsonRpcProvider } from "ethers";
import { NetworkType } from "./constants";

// ==================== AERODROME V3 ABI DEFINITIONS ====================

/**
 * Aerodrome V3 Factory ABI
 * Similar to Uniswap V3 but with Aerodrome-specific implementations
 */
export const AERODROME_V3_FACTORY_ABI = [
    {
        inputs: [
            { internalType: "address", name: "tokenA", type: "address" },
            { internalType: "address", name: "tokenB", type: "address" },
            { internalType: "int24", name: "tickSpacing", type: "int24" }
        ],
        name: "getPool",
        outputs: [{ internalType: "address", name: "pool", type: "address" }],
        stateMutability: "view",
        type: "function",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "token0", type: "address" },
            { indexed: true, internalType: "address", name: "token1", type: "address" },
            { indexed: true, internalType: "int24", name: "tickSpacing", type: "int24" },
            { indexed: false, internalType: "address", name: "pool", type: "address" }
        ],
        name: "PoolCreated",
        type: "event",
    },
] as const;

/**
 * Aerodrome V3 Pool ABI
 * Inherits from Uniswap V3 with additional features
 */
export const AERODROME_V3_POOL_ABI = [
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
            { internalType: "bool", name: "unlocked", type: "bool" }
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
        name: "tickSpacing",
        outputs: [{ internalType: "int24", name: "", type: "int24" }],
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

/**
 * Aerodrome V3 Quoter ABI
 */
export const AERODROME_V3_QUOTER_ABI = [
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "tokenIn",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "tokenOut",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amountIn",
                        "type": "uint256"
                    },
                    {
                        "internalType": "int24",
                        "name": "tickSpacing",
                        "type": "int24"
                    },
                    {
                        "internalType": "uint160",
                        "name": "sqrtPriceLimitX96",
                        "type": "uint160"
                    }
                ],
                "internalType": "struct IQuoterV2.QuoteExactInputSingleParams",
                "name": "params",
                "type": "tuple"
            }
        ],
        "name": "quoteExactInputSingle",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountOut",
                "type": "uint256"
            },
            {
                "internalType": "uint160",
                "name": "sqrtPriceX96After",
                "type": "uint160"
            },
            {
                "internalType": "uint32",
                "name": "initializedTicksCrossed",
                "type": "uint32"
            },
            {
                "internalType": "uint256",
                "name": "gasEstimate",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
] as const;

// ==================== AERODROME V3 CONSTANTS ====================

/**
 * Aerodrome V3 uses tick spacing instead of fee tiers
 * Common tick spacings:
 * - 1: 0.01% fee (lowest volatility pairs)
 * - 50: 0.05% fee
 * - 100: 0.30% fee (most common)
 * - 200: 1.00% fee (exotic pairs)
 */
export const AERODROME_TICK_SPACINGS = [1, 50, 100, 200];

/**
 * Fee calculation from tick spacing
 * Aerodrome uses: fee = tickSpacing * 100
 */
export const calculateFeeFromTickSpacing = (tickSpacing: number): number => {
    return tickSpacing * 100;
};

// ==================== AERODROME V3 NETWORK CONFIGS ====================



// ==================== AERODROME V3 QUOTE CALCULATOR ====================

export class AerodromeV3QuoteCalculator extends UniswapV3QuoteCalculator {
    private tickSpacings: number[];

    constructor(
        config: DexConfig,
        chainConfig: ChainConfig,
        provider?: JsonRpcProvider,
        tickSpacings: number[] = AERODROME_TICK_SPACINGS
    ) {
        // Use provided provider or create a new one
        const rpcProvider = provider || new JsonRpcProvider(chainConfig.rpcUrl);

        super(config, chainConfig, rpcProvider);
        this.tickSpacings = tickSpacings;
    }

    /**
     * Override findBestPool to use tick spacings instead of fee tiers
     */
    public async findBestPool(tokenA: string, tokenB: string) {
        if (tokenA.toLowerCase() === this.config.nativeTokenAddress.toLowerCase()) {
            tokenA = this.config.wrappedNativeTokenAddress;
        }
        if (tokenB.toLowerCase() === this.config.nativeTokenAddress.toLowerCase()) {
            tokenB = this.config.wrappedNativeTokenAddress;
        }
        if (tokenA.toLowerCase() === tokenB.toLowerCase()) {
            throw new Error("TokenA and TokenB cannot be the same");
        }
        const { Contract } = await import("ethers");
        const factory = new Contract(
            this.config.factoryAddress,
            AERODROME_V3_FACTORY_ABI,
            this.provider
        );

        let bestPool: any = null;

        for (const tickSpacing of this.tickSpacings) {
            try {
                const poolAddress: string = await factory.getPool(tokenA, tokenB, tickSpacing);

                if (poolAddress === "0x0000000000000000000000000000000000000000") {
                    continue;
                }

                const pool = new Contract(poolAddress, AERODROME_V3_POOL_ABI, this.provider);
                const { Decimal } = await import("decimal.js");
                const liquidity = new Decimal((await pool.liquidity()).toString());

                if (liquidity.gt(0) && (!bestPool || liquidity.gt(bestPool.liquidity))) {
                    const fee = calculateFeeFromTickSpacing(tickSpacing);
                    bestPool = {
                        pool,
                        fee,
                        liquidity,
                        address: poolAddress,
                    };
                }
            } catch (error) {
                console.warn(`Error checking pool for tick spacing ${tickSpacing}:`, error);
            }
        }

        if (!bestPool) {
            throw new Error(`No viable Aerodrome pool found for token pair ${tokenA}/${tokenB}`);
        }

        const poolData = await this.getPoolData(bestPool.address);
        return { ...bestPool, poolData };
    }

    /**
     * Override getAllPools to use Aerodrome-specific event structure
     */
    public async getAllPools(abi = AERODROME_V3_FACTORY_ABI, fromBlock?: string) {
        return super.getAllPools(abi, fromBlock);
    }
    getAllPoolsFromEvents = async (
        factoryAddress: string,
        provider: JsonRpcProvider,
        fromBlockHeight: string = this.config.fromBlock || "0",
        abi: any
    ) => {
        console.log("getting all the pools for chain: ", this.config.network, "rpc: ", this.chainConfig.rpcUrl, " provider rpc", provider._getConnection().url);
        const factory = new Contract(factoryAddress, abi, provider);

        const latestBlock = await provider.getBlockNumber();

        // Create filter for PoolCreated events
        // Event signature: PoolCreated(address,address,uint24,int24,int24,address)
        const filter = factory.filters.PoolCreated();

        // Get all PoolCreated events from the specified block range
        const events = await factory.queryFilter(
            filter,
            parseInt(fromBlockHeight),
            latestBlock
        );

        console.log('these are all the events fetched: ', events.length);

        // Map events to a more convenient format
        const pools: PoolCreatedEvent[] = events.map((event: any) => ({
            token0: event.args.token0,
            token1: event.args.token1,
            fee: event.args.tickSpacing.toString(),
            poolAddress: event.args.pool,
            blockNumber: event.blockNumber.toString(),
        }));

        // const dataToWrite = {
        //     pools: pools,
        //     lastBlockNumber: pools[pools.length - 1].blockNumber,
        // }


        return pools;
    }


    /**
     * Override simulateTransaction to use Aerodrome's quoter
     */
    public async simulateTransaction(
        tokenIn: string,
        tokenOut: string,
        amountIn: string,
        tickSpacing: number = 100,
        sqrtPriceLimitX96: string = "0"
    ): Promise<string> {
        if (!this.config.quoterAddress) {
            throw new Error("Quoter address not configured for Aerodrome");
        }

        const { Contract } = await import("ethers");
        const quoter = new Contract(
            this.config.quoterAddress,
            AERODROME_V3_QUOTER_ABI,
            this.provider
        );

        try {

            const result = await quoter.quoteExactInputSingle.staticCall(
                { tokenIn, tokenOut, amountIn: BigInt(amountIn), tickSpacing, sqrtPriceLimitX96: BigInt(sqrtPriceLimitX96) }
            );

            return result.amountOut.toString(); // amountOut
        } catch (error) {
            console.error("Aerodrome quote simulation failed:", error);
            return "0";
        }
    }

    /**
     * Get supported tick spacings
     */
    public getTickSpacings(): number[] {
        return [...this.tickSpacings];
    }

    /**
     * Add custom tick spacing
     */
    public addTickSpacing(tickSpacing: number): void {
        if (!this.tickSpacings.includes(tickSpacing)) {
            this.tickSpacings.push(tickSpacing);
            this.tickSpacings.sort((a, b) => a - b);
        }
    }
}

// ==================== USAGE EXAMPLE ====================



