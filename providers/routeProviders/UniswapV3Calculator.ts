/**
 * Uniswap V3 Quote Calculator - Reusable Class Version
 * 
 * A generic class for calculating swap quotes on any Uniswap V3 compatible DEX.
 * Supports multiple networks and can be easily extended for different protocols.
 */

import { ethers, Contract, JsonRpcProvider } from "ethers";
import Decimal from "decimal.js";
import { get0gPrice, getTokenPrice } from "./price";

// ==================== TYPES ====================

export interface Token {
    address: string;
    decimals: number;
    symbol: string;
}

export interface PoolInfo {
    pool: Contract;
    fee: number;
    liquidity: Decimal;
    address: string;
}

export interface PoolData {
    token0: Token;
    token1: Token;
    fee: number;
    poolAddress: string;
    slot0: any;
    sqrtPriceX96: string;
    liquidity: string;
    blockNumber?: string
}

export interface SwapResult {
    amountOut: Decimal;
    sqrtPNext: Decimal;
    feeAmount: Decimal;
    amountInAfterFee: Decimal;
}

export interface QuoteResult {
    price: number;
    amountIn: Decimal;
    amountOut: Decimal;
    poolAddress: string;
    fee: Decimal;
    sqrtPriceStart: Decimal;
    sqrtPriceNext: Decimal;
    liquidity: Decimal;
    tokenInDecimals: number;
    tokenOutDecimals: number;
    zeroForOne: boolean;
}

export interface PoolCreatedEvent {
    token0: string;
    token1: string;
    fee: string;
    poolAddress: string;
    blockNumber: number;
}

export interface DexConfig {
    name: string;
    factoryAddress: string;
    quoterAddress: string;
    fromBlock?: string;
    abi: any
    wrappedNativeTokenAddress: string;
    nativeTokenAddress: string
    stableTokenAddress?: string; // For USD price calculations
}

export interface QuoteParams {
    tokenIn: string;
    tokenOut: string;
    amountIn: number;
    aToB?: boolean;
    amountInFormattedInDecimal?: Decimal;
    pool?: PoolData;
}

// ==================== CONSTANTS ====================

const FEE_TIERS: number[] = [100, 500, 3000, 10000];
const FEE_DENOMINATOR = new Decimal(1_000_000);
const Q96: Decimal = new Decimal(2).pow(new Decimal(96));

// ==================== ABI DEFINITIONS ====================

const FACTORY_ABI = [
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
] as const;

const POOL_ABI = [
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
            { internalType: "uint8", name: "feeProtocol", type: "uint8" },
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

const ERC20_ABI = [
    {
        inputs: [],
        name: "decimals",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "symbol",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
    },
] as const;

const QUOTER_ABI = [
    {
        inputs: [
            { internalType: "address", name: "tokenIn", type: "address" },
            { internalType: "address", name: "tokenOut", type: "address" },
            { internalType: "uint24", name: "fee", type: "uint24" },
            { internalType: "uint256", name: "amountIn", type: "uint256" },
            { internalType: "uint160", name: "sqrtPriceLimitX96", type: "uint160" },
        ],
        name: "quoteExactInputSingle",
        outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
] as const;

// ==================== MAIN CLASS ====================
const priceCache = new Map()
export class UniswapV3QuoteCalculator {
    private provider: JsonRpcProvider;
    private config: DexConfig;
    private priceCache: Map<string, { price: number; timestamp: number }>;
    private poolCache: Map<string, PoolData>;
    private readonly CACHE_DURATION = 0.5 * 60 * 1000; // 5 minutes

    constructor(config: DexConfig, provider: JsonRpcProvider) {
        this.config = config;
        this.provider = provider
        this.priceCache = new Map();
        this.poolCache = new Map();
    }
    // ==================== PRICE METHODS ======================


    getPriceFromPriceMap = (tokenAddress: string): number | undefined => {

        const cached = priceCache.get(tokenAddress);
        if (cached && this.isCacheValid(cached.timestamp)) {
            return cached.price;
        }
        return undefined;
    };
    setPriceInPriceMap = (tokenAddress: string, price: number) => {
        priceCache.set(tokenAddress, { price, timestamp: Date.now() });

    };
    async getSureTokenPrice(tokenAddress: string, _provider = this.provider): Promise<number> {
        // we should add the cache here
        if (tokenAddress.toLowerCase() === this.config.nativeTokenAddress.toLowerCase()) {
            tokenAddress = this.config.wrappedNativeTokenAddress
        }
        try {
            const cachedPrice = this.getPriceFromPriceMap(tokenAddress);
            // console.log('cachedPrice: ', cachedPrice);
            if (cachedPrice !== undefined) {
                return cachedPrice;
            }
            const price = await this.getTokenUsdPriceFromPool(tokenAddress);
            this.setPriceInPriceMap(tokenAddress, price);
            return price;
        } catch (error) {
            console.error("Error fetching token price from pool using crypto compare....:");
        }
        const tokenData = await this.getTokenDetails(tokenAddress);
        if (!tokenData) {
            throw new Error(`Token details not found for address: ${tokenAddress}`);
        }
        const tokenSymbol = tokenData.symbol.toUpperCase();
        console.log(`Fetching price for token: ${tokenSymbol}`);
        if (tokenSymbol.toLowerCase() === "usdt_v1") return 1 //for the custom USDT token
        const cPrice = await this.getTokenPriceFromExternalAPI(tokenSymbol);
        this.setPriceInPriceMap(tokenAddress, cPrice);
        return cPrice;
    }

    // ==================== UTILITY METHODS ====================

    private async wait(seconds: number = 2): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    private isCacheValid(timestamp: number): boolean {
        return Date.now() - timestamp < this.CACHE_DURATION;
    }

    // ==================== TOKEN METHODS ====================

    public async getTokenDetails(tokenAddress: string, provider = this.provider): Promise<Token> {
        const cacheKey = `token_${tokenAddress}`;
        const cached = this.poolCache.get(cacheKey);

        if (cached) {
            return cached as any; // Cast for token details
        }

        // console.log('tokenAddress: ', tokenAddress);
        // console.log('tokenAddress: ', tokenAddress);
        // console.log('tokenAddress: ', tokenAddress);
        // console.log('tokenAddress: ', tokenAddress);
        const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
        const [decimals, symbol] = await Promise.all([
            tokenContract.decimals(),
            tokenContract.symbol(),
        ]);

        const tokenDetails: Token = {
            address: tokenAddress,
            decimals: Number(decimals),
            symbol: symbol,
        };

        return tokenDetails;
    }

    public async getTokenPrice(tokenAddress: string): Promise<number> {
        const cached = priceCache.get(tokenAddress);
        if (cached && this.isCacheValid(cached.timestamp)) {
            return cached.price;
        }

        try {
            // Try to get price from pool if stable token is configured
            if (this.config.stableTokenAddress) {
                const price = await this.getTokenUsdPriceFromPool(tokenAddress);
                priceCache.set(tokenAddress, { price, timestamp: Date.now() });
                return price;
            }
        } catch (error) {
            console.warn(`Failed to get pool price for ${tokenAddress}:`, error);
        }

        // Fallback to external API
        try {
            const tokenData = await this.getTokenDetails(tokenAddress);
            const price = await this.getTokenPriceFromExternalAPI(tokenData.symbol);
            priceCache.set(tokenAddress, { price, timestamp: Date.now() });
            return price;
        } catch (error) {
            console.error(`Failed to get price for token ${tokenAddress}:`, error);
            throw new Error(`Unable to fetch price for token ${tokenAddress}`);
        }
    }

    private async getTokenPriceFromExternalAPI(symbol: string): Promise<number> {
        if (symbol.toLowerCase() === "w0g") {
            const p = (await getTokenPrice('0G')).data?.price
            if (p) return p
        }
        const response = await fetch(
            `https://min-api.cryptocompare.com/data/price?fsym=${symbol.toUpperCase()}&tsyms=USD`
        );
        const data = await response.json();
        return data["USD"]
    }

    private async getTokenUsdPriceFromPoolUsingStableCoin(tokenAddress: string): Promise<number> {
        if (!this.config.stableTokenAddress) {
            throw new Error("Stable token address not configured");
        }
        if (tokenAddress.toLowerCase() === this.config.stableTokenAddress.toLowerCase()) {

            return 1;
        }

        const { poolData } = await this.findBestPool(
            tokenAddress,
            this.config.stableTokenAddress
        );

        const aToB = this.config.stableTokenAddress.toLowerCase() ===
            poolData.token1.address.toLowerCase();

        return this.calculateSpotPrice(
            new Decimal(poolData.slot0.sqrtPriceX96),
            poolData.token0.decimals,
            poolData.token1.decimals,
            aToB
        );
    }
    async getTokenUsdPriceFromPoolWrappedToken(tokenAddress: string): Promise<number> {
        if (!this.config.wrappedNativeTokenAddress) {
            throw new Error("Wrapped native token address not configured");
        }
        let price: number
        if (tokenAddress.toLowerCase() === this.config.wrappedNativeTokenAddress.toLowerCase()) {
            price = 1;
        } else {
            try {

                const { poolData } = await this.findBestPool(
                    tokenAddress,
                    this.config.wrappedNativeTokenAddress
                );

                const aToB = this.config.wrappedNativeTokenAddress.toLowerCase() ===
                    poolData.token1.address.toLowerCase();

                price = this.calculateSpotPrice(
                    new Decimal(poolData.slot0.sqrtPriceX96),
                    poolData.token0.decimals,
                    poolData.token1.decimals,
                    aToB
                );
            } catch (error) {
                price = 0

            }
        }


        const wrappedTokenPrice = await get0gPrice()

        if (!wrappedTokenPrice.data?.price) {
            throw new Error("Unable to fetch wrapped token price")
        }
        return price * wrappedTokenPrice.data?.price
    }
    private async getTokenUsdPriceFromPool(tokenAddress: string): Promise<number> {
        // Fallback to wrapped native token
        try {
            return await this.getTokenUsdPriceFromPoolWrappedToken(tokenAddress);
        } catch (error) {
            console.error(`Failed to get USD price from wrapped native token for ${tokenAddress}:`, error);

        }

        try {
            return await this.getTokenUsdPriceFromPoolUsingStableCoin(tokenAddress);
        } catch (error) {
            console.warn(`Failed to get USD price from pool for ${tokenAddress}:`);
            throw new Error(`Unable to fetch USD price for token ${tokenAddress}`);
        }

    }

    // ==================== POOL METHODS ====================

    public async getPoolData(poolAddress: string): Promise<PoolData> {
        const cached = this.poolCache.get(poolAddress);
        if (cached) {
            return cached;
        }

        const pool = new Contract(poolAddress, POOL_ABI, this.provider);



        const [slot0, liquidity, token0Address, token1Address, fee] = await Promise.all([
            pool.slot0(),
            pool.liquidity(),
            pool.token0(),
            pool.token1(),
            pool.fee(),
        ]);

        console.log('token0Address: ', token0Address);
        console.log('token1Address: ', token1Address);
        const [token0Details, token1Details] = await Promise.all([
            this.getTokenDetails(token0Address),
            this.getTokenDetails(token1Address),
        ]);

        const poolData: PoolData = {
            token0: token0Details,
            token1: token1Details,
            fee: Number(fee),
            poolAddress,
            slot0,
            sqrtPriceX96: slot0.sqrtPriceX96.toString(),
            liquidity: liquidity.toString(),
        };

        this.poolCache.set(poolAddress, poolData);
        return poolData;
    }

    public async findBestPool(tokenA: string, tokenB: string): Promise<PoolInfo & { poolData: PoolData }> {
        const factory = new Contract(this.config.factoryAddress, FACTORY_ABI, this.provider);
        let bestPool: PoolInfo | null = null;

        for (const fee of FEE_TIERS) {
            try {
                const poolAddress: string = await factory.getPool(tokenA, tokenB, fee);

                if (poolAddress === "0x0000000000000000000000000000000000000000") {
                    continue;
                }

                const pool = new Contract(poolAddress, POOL_ABI, this.provider);
                const liquidity = new Decimal(await pool.liquidity());

                if (liquidity.gt(0) && (!bestPool || liquidity.gt(bestPool.liquidity))) {
                    bestPool = {
                        pool,
                        fee,
                        liquidity,
                        address: poolAddress,
                    };
                }
            } catch (error) {
                console.warn(`Error checking pool for fee ${fee}:`);
            }
        }

        if (!bestPool) {
            throw new Error(`No viable pool found for token pair ${tokenA}/${tokenB}`);
        }

        const poolData = await this.getPoolData(bestPool.address);
        return { ...bestPool, poolData };
    }

    // ==================== CALCULATION METHODS ====================

    public calculateSpotPrice(
        sqrtPriceX96: Decimal,
        decimals0: number,
        decimals1: number,
        token0IsInput: boolean
    ): number {
        const sqrtPrice = Number(sqrtPriceX96) / Number(Q96);
        let price = sqrtPrice * sqrtPrice;

        const decimalAdjustment = 10 ** (decimals0 - decimals1);
        price = price * decimalAdjustment;

        return token0IsInput ? price : 1 / price;
    }

    private calculateSwapOutput(params: {
        amountInRaw: Decimal;
        sqrtPriceX96: Decimal;
        liquidity: Decimal;
        fee: number;
        zeroForOne: boolean;
        decimalsIn: number;
        decimalsOut: number;
    }): SwapResult {
        const { amountInRaw, sqrtPriceX96, liquidity, fee, zeroForOne, decimalsIn, decimalsOut } = params;

        const feeDecimal = new Decimal(fee);
        const feeAmount = amountInRaw.mul(feeDecimal).div(FEE_DENOMINATOR);
        const amountInAfterFee = amountInRaw.sub(feeAmount);

        let sqrtPNext: Decimal;

        if (zeroForOne) {
            const numerator = amountInAfterFee.mul(Q96);
            const delta = numerator.div(liquidity);
            sqrtPNext = sqrtPriceX96.add(delta);
        } else {
            const numerator = amountInAfterFee.mul(sqrtPriceX96).mul(sqrtPriceX96);
            const denominator = liquidity.mul(Q96);
            sqrtPNext = sqrtPriceX96.sub(numerator.div(denominator));
        }

        let amountOut: Decimal;

        if (zeroForOne) {
            const delta = sqrtPNext.sub(sqrtPriceX96);
            const numerator = liquidity.mul(Q96).mul(delta);
            const denominator = sqrtPNext.mul(sqrtPriceX96);
            amountOut = numerator.div(denominator);
        } else {
            const delta = sqrtPriceX96.sub(sqrtPNext);
            amountOut = liquidity.mul(delta).div(Q96);
        }

        // Adjust for decimals
        let adjustedAmountOut = amountOut;
        if (decimalsIn > decimalsOut) {
            const diff = new Decimal(10).pow(new Decimal(decimalsIn - decimalsOut));
            adjustedAmountOut = amountOut.div(diff);
        } else if (decimalsOut > decimalsIn) {
            const diff = new Decimal(10).pow(new Decimal(decimalsOut - decimalsIn));
            adjustedAmountOut = amountOut.mul(diff);
        }

        return {
            amountOut: adjustedAmountOut,
            sqrtPNext,
            feeAmount,
            amountInAfterFee,
        };
    }

    // ==================== QUOTE METHODS ====================

    public async getQuote(params: QuoteParams): Promise<QuoteResult> {
        let pool: PoolData;
        let aToB: boolean;
        let amountInDecimal: Decimal;

        if (params.pool) {
            pool = params.pool;
        } else {
            const bestPool = await this.findBestPool(params.tokenIn, params.tokenOut);
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

    public getAmountOut(params: {
        aToB: boolean;
        amountInFormattedInDecimal: Decimal;
        pool: PoolData;
    }): QuoteResult {
        const { aToB, amountInFormattedInDecimal, pool } = params;
        const { liquidity, token0, token1, fee, poolAddress, sqrtPriceX96 } = pool;

        const tokenInObj = aToB ? token0 : token1;
        const tokenOutObj = aToB ? token1 : token0;
        const decimalsIn = Number(tokenInObj.decimals);
        const decimalsOut = Number(tokenOutObj.decimals);

        const zeroForOne = aToB;

        const { sqrtPNext, amountOut, feeAmount } = this.calculateSwapOutput({
            amountInRaw: amountInFormattedInDecimal,
            sqrtPriceX96: new Decimal(sqrtPriceX96),
            liquidity: new Decimal(liquidity),
            fee,
            zeroForOne: !zeroForOne,
            decimalsIn,
            decimalsOut,
        });

        const spotPrice = this.calculateSpotPrice(
            new Decimal(sqrtPriceX96),
            zeroForOne ? decimalsIn : decimalsOut,
            zeroForOne ? decimalsOut : decimalsIn,
            zeroForOne
        );

        return {
            price: spotPrice,
            amountIn: amountInFormattedInDecimal,
            amountOut,
            poolAddress,
            fee: feeAmount,
            sqrtPriceStart: new Decimal(sqrtPriceX96),
            sqrtPriceNext: sqrtPNext,
            liquidity: new Decimal(liquidity),
            tokenInDecimals: decimalsIn,
            tokenOutDecimals: decimalsOut,
            zeroForOne,
        };
    }

    // ==================== QUOTER CONTRACT METHODS ====================

    public async simulateTransaction(
        tokenIn: string,
        tokenOut: string,
        amountIn: string,
        fee: number,
        sqrtPriceLimitX96: string = "0"
    ): Promise<string> {
        if (!this.config.quoterAddress) {
            throw new Error("Quoter address not configured for this DEX");
        }

        const quoter = new Contract(this.config.quoterAddress, QUOTER_ABI, this.provider);
        console.log('this.config.quoterAddress: ', this.config.quoterAddress);

        console.log('this.provider._getConnection().url: ', this.provider._getConnection().url);
        console.log('tokenIn: ', tokenIn);
        console.log('tokenOut: ', tokenOut);
        console.log('amountIn: ', amountIn);
        try {
            const amountOut = await quoter.quoteExactInputSingle(
                tokenIn,
                tokenOut,
                fee,
                BigInt(Number(amountIn)),
                sqrtPriceLimitX96
            );


            return amountOut.toString();
        } catch (error) {
            console.error("Quote simulation failed:", error);
            return "0"
        }
    }
    // ==================== POOL DISCOVERY ====================

    /**
     * Initializes and fetches all pool creation events from the factory
     * This function scans the blockchain for PoolCreated events to build a pool registry
     * 
     * @param factoryAddress - Address of the Uniswap V3 factory
     * @param fromBlockHeight - Starting block height for event scanning
     * @param provider - blockchain connection
     * @returns Promise<PoolCreatedEvent[]> - Array of pool creation events
     */

    getAllPoolsFromEvents = async (
        factoryAddress: string,
        provider: JsonRpcProvider,
        fromBlockHeight: string = this.config.fromBlock || "0",
        abi: any
    ) => {

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

        // Map events to a more convenient format
        const pools: PoolCreatedEvent[] = events.map((event: any) => ({
            token0: event.args.token0,
            token1: event.args.token1,
            fee: event.args.fee.toString(),
            poolAddress: event.args.pool,
            blockNumber: event.blockNumber.toString(),
        }));

        // const dataToWrite = {
        //     pools: pools,
        //     lastBlockNumber: pools[pools.length - 1].blockNumber,
        // }


        return pools;
    }

    // ==================== POOL DISCOVERY METHODS ====================

    public async getAllPools(abi: any, fromBlock?: string): Promise<PoolData[]> {
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
            // if (count > 9) {
            //     await wait(5)
            //     count = 0
            // }
            await wait(10)
        }

        // console.log('poolsData: ', poolsData);
        return poolsData // no longer filtering by liquidity
    }

    // ==================== GETTER METHODS ====================

    public getConfig(): DexConfig {
        return { ...this.config };
    }

    public getProvider(): JsonRpcProvider {
        return this.provider;
    }

    public clearCache(): void {
        priceCache.clear();
        this.poolCache.clear();
    }

    public setCacheTimeout(durationMs: number): void {
        // @ts-ignore
        this.CACHE_DURATION = durationMs;
    }
}

// ==================== PREDEFINED CONFIGS ====================

export const DEX_CONFIGS = {
    ZERODEX_TESTNET: {
        name: "ZeroDEX Testnet",
        factoryAddress: "0x7453582657F056ce5CfcEeE9E31E4BC390fa2b3c",
        quoterAddress: "0x8d5E064d2EF44C29eE349e71CF70F751ECD62892",
        rpcUrl: "https://evmrpc-testnet.0g.ai",
        fromBlock: 171522,
        stableTokenAddress: "0x3eC8A8705bE1D5ca90066b37ba62c4183B024ebf", // USDT
    },
    UNISWAP_V3_MAINNET: {
        name: "Uniswap V3 Mainnet",
        factoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        quoterAddress: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
        rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
        stableTokenAddress: "0xA0b86a33E6441b8d6c6e4fC6F120d4d5A1b9A651", // USDT
    },
} as const;

// ==================== USAGE EXAMPLE ====================

/*
// Example usage:
const calculator = new UniswapV3QuoteCalculator(DEX_CONFIGS.ZERODEX_TESTNET);

// Get a quote
const quote = await calculator.getQuote({
    tokenIn: "0x...",
    tokenOut: "0x...",
    amountIn: 1000
});

// Get token price
const price = await calculator.getTokenPrice("0x...");

// Simulate transaction
const amountOut = await calculator.simulateTransaction(
    "0x...", // tokenIn
    "0x...", // tokenOut
    "1000000000000000000", // amountIn (1 token with 18 decimals)
    3000 // fee tier
);
*/


export const wait = (time = 2) => {
    return new Promise((resolve) => setTimeout(resolve, time * 1000));
};




