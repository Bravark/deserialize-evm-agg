/**
 * Uniswap V3 Quote Calculator - Ethers.js Version
 * 
 * This module provides functionality to calculate swap quotes for Uniswap V3 compatible DEXs
 * using Ethers.js library for blockchain interactions.
 * 
 * Documentation:
 * - Ethers.js v6: https://docs.ethers.org/v6/
 * - Uniswap V3 Core: https://docs.uniswap.org/contracts/v3/reference/core/
 * - Uniswap V3 Math: https://docs.uniswap.org/sdk/v3/guides/swaps/quoting/
 */

import { ethers, Contract, JsonRpcProvider } from "ethers";
import * as abi from "../../zer0dexV3Factory.json";

import fs from "fs"
import Decimal from "decimal.js";

// ==================== TYPES ====================

/**
 * Represents a Uniswap V3 pool with its metadata
 */
interface PoolInfo {
    pool: Contract;
    fee: number;
    liquidity: Decimal;
    address: string;

}

/**
 * Response from CryptoCompare API
 */
interface CryptoCompareResponse {
    [key: string]: number;
}

/**
 * Swap calculation result
 */
interface SwapResult {
    amountOut: Decimal;
    sqrtPNext: Decimal;
    feeAmount: Decimal;
    amountInAfterFee: Decimal;
}

/**
 * Quote result containing all relevant swap information
 */
interface QuoteResult {
    price: number;
    amountIn: Decimal;
    amountOut: Decimal
    poolAddress: string;
    fee: Decimal;
    sqrtPriceStart: Decimal;
    sqrtPriceNext: Decimal;
    liquidity: Decimal;
    tokenInDecimals: number;
    tokenOutDecimals: number;
    zeroForOne: boolean;
}

/**
 * Pool creation event data
 */
interface PoolCreatedEvent {
    token0: string;
    token1: string;
    fee: string;
    poolAddress: string;
    blockNumber: number
}

// ==================== CONSTANTS ====================

/**
 * Standard Uniswap V3 fee tiers
 * 100 = 0.01%, 500 = 0.05%, 3000 = 0.3%, 10000 = 1%
 */
const FEE_TIERS: number[] = [100, 500, 3000, 10000];

/**
 * Fee denominator for percentage calculations (10000 = 100%)
 */
const FEE_DENOMINATOR = new Decimal(1_000_000); // Uniswap V3 uses 1e6 denominator for fees

/**
 * Q96 constant used in Uniswap V3 price calculations
 * Represents 2^96 for fixed-point arithmetic
 */
const Q96: Decimal = new Decimal(2).pow(new Decimal(96));

const RPC_URL = "https://evmrpc-testnet.0g.ai"

export const provider = new JsonRpcProvider(RPC_URL);

// ==================== ABI DEFINITIONS ====================

/**
 * Uniswap V3 Factory ABI - minimal interface for pool lookup
 * Reference: https://docs.uniswap.org/contracts/v3/reference/core/UniswapV3Factory
 */
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

/**
 * Uniswap V3 Pool ABI - minimal interface for price and liquidity data
 * Reference: https://docs.uniswap.org/contracts/v3/reference/core/UniswapV3Pool
 */
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
        outputs: [
            {
                internalType: "uint24",
                name: "",
                type: "uint24"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
] as const;

/**
 * ERC20 ABI - minimal interface for token metadata
 * Reference: https://eips.ethereum.org/EIPS/eip-20
 */
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

// ==================== UTILITY FUNCTIONS ====================

/**
 * Fetches token price from CryptoCompare API
 * @param fsym - Token symbol (e.g., "ETH", "USDC")
 * @returns Promise<number> - Token price in USD
 */
async function getTokenPriceFromCryptoCompare(fsym: string): Promise<number> {
    const response = await fetch(
        `https://min-api.cryptocompare.com/data/price?fsym=${fsym}&tsyms=USD`
    );
    const data = await response.json() as CryptoCompareResponse;
    return data["USD"];
}
export const priceMap = new Map<string, number>();
export const getPriceFromPriceMap = (tokenAddress: string): number | undefined => {
    return priceMap.get(tokenAddress);
};
export const setPriceInPriceMap = (tokenAddress: string, price: number) => {
    priceMap.set(tokenAddress, price);
};
export async function getSureTokenPrice(tokenAddress: string, _provider = provider): Promise<number> {
    // we should add the cache here
    try {
        const cachedPrice = getPriceFromPriceMap(tokenAddress);
        if (cachedPrice !== undefined) {
            return cachedPrice;
        }
        const price = await getTokenUsdPriceFromPool(tokenAddress, _provider);
        setPriceInPriceMap(tokenAddress, price);
        return price;
    } catch (error) {
        console.error("Error fetching token price from pool using crypto compare....:");
    }
    const tokenData = await getTokenDetails(tokenAddress, _provider);
    if (!tokenData) {
        throw new Error(`Token details not found for address: ${tokenAddress}`);
    }
    const tokenSymbol = tokenData.symbol.toUpperCase();
    console.log(`Fetching price for token: ${tokenSymbol}`);
    if (tokenSymbol.toLowerCase() === "usdt_v1") return 1 //for the custom USDT token
    const cPrice = await getTokenPriceFromCryptoCompare(tokenSymbol);
    setPriceInPriceMap(tokenAddress, cPrice);
    return cPrice;
}

/**
 * Finds the best pool (highest liquidity) for a given token pair
 * Iterates through all fee tiers to find the most liquid pool
 * 
 * @param provider - Ethers provider instance
 * @param tokenA - Address of first token
 * @param tokenB - Address of second token
 * @param factoryAddress - Address of the Uniswap V3 factory
 * @returns Promise<PoolInfo> - Best pool information
 */
async function findBestPool(
    provider: JsonRpcProvider,
    tokenA: string,
    tokenB: string,
    factoryAddress: string
): Promise<PoolInfo & { poolData: PoolData }> {
    // Create factory contract instance
    const factory = new Contract(factoryAddress, FACTORY_ABI, provider);
    let bestPool: PoolInfo | null = null;

    // Iterate through all fee tiers to find the most liquid pool
    for (const fee of FEE_TIERS) {
        try {
            // Get pool address for this fee tier
            const poolAddress: string = await factory.getPool(tokenA, tokenB, fee);

            // Skip if pool doesn't exist (returns zero address)
            if (poolAddress === "0x0000000000000000000000000000000000000000") {
                continue;
            }

            // Create pool contract instance
            const pool = new Contract(poolAddress, POOL_ABI, provider);

            // Get current liquidity
            const liquidity: Decimal = await pool.liquidity();
            // console.log('liquidity: ', liquidity);
            const slot0 = await pool.slot0()
            // console.log('slot0: ', slot0);

            // Update best pool if this one has higher liquidity
            if ((new Decimal(liquidity)).gt(new Decimal(0)) && (!bestPool || (new Decimal(liquidity)).gt(bestPool.liquidity))) {
                bestPool = {
                    pool,
                    fee,
                    liquidity,
                    address: poolAddress,
                };
            }
        } catch (error: any) {
            console.log('error: ', error);
            throw new Error(`Error checking pool for fee ${fee}: ${error.message}`);
        }
    }

    if (!bestPool) {
        throw new Error("No viable pool found for token pair");
    }
    const poolData = await getPoolData(bestPool.address)
    // console.log('got pool poolData: ', poolData);
    return { ...bestPool, poolData };
}

/**
 * Calculates spot price from sqrt price and token decimals
 * Uses Uniswap V3 sqrt price formula: price = (sqrtPriceX96 / 2^96)^2
 * 
 * @param sqrtPriceX96 - Square root price in X96 format
 * @param decimals0 - Decimals of token0
 * @param decimals1 - Decimals of token1
 * @param token0IsInput - Whether token0 is the input token
 * @returns number - Spot price
 */
export function calculateSpotPrice(
    sqrtPriceX96: Decimal,
    decimals0: number,
    decimals1: number,
    token0IsInput: boolean
): number {
    // Convert sqrt price from X96 format to decimal
    const sqrtPrice = Number(sqrtPriceX96) / Number(Q96);

    // Square to get actual price
    let price = sqrtPrice * sqrtPrice;

    // Adjust for token decimal differences
    const decimalAdjustment = 10 ** (decimals0 - decimals1);
    price = price * decimalAdjustment;

    // Invert price if token1 is the input (we want input/output ratio)
    return token0IsInput ? price : 1 / price;
}
const USDT_ADDRESS = "0x3eC8A8705bE1D5ca90066b37ba62c4183B024ebf"
export const getTokenUsdPriceFromPool = async (tokenAddress: string, _provider = provider, _poolData?: PoolData) => {
    //get the token and usdt pool
    let poolData = _poolData
    if (!poolData) {
        const { poolData: __poolData } = await findBestPool(_provider, tokenAddress, USDT_ADDRESS, FACTORY_ADDRESS.zerodex)
        poolData = __poolData
    }
    const aToB = USDT_ADDRESS.toLowerCase() === poolData.token1.address.toLowerCase();
    return calculateSpotPrice(poolData.slot0.sqrtPriceX96, poolData.token0.decimals, poolData.token1.decimals, aToB)
}

/**
 * Calculates swap output using Uniswap V3 constant product formula
 * This is a simplified approximation - real swaps may have different results
 * due to tick spacing and other factors
 * 
 * Reference: https://docs.uniswap.org/sdk/v3/guides/swaps/quoting/
 * 
 * @param params - Swap calculation parameters
 * @returns SwapResult - Calculated swap amounts and new price
 */

function calculateSwapOutput({
    amountInRaw,
    sqrtPriceX96,
    liquidity,
    fee,
    zeroForOne,
    decimalsIn,
    decimalsOut,
}: {
    amountInRaw: Decimal;
    sqrtPriceX96: Decimal;
    liquidity: Decimal;
    fee: number;
    zeroForOne: boolean;
    decimalsIn: number;
    decimalsOut: number;
}): SwapResult {
    const feeDecimal = new Decimal(fee);
    const feeAmount = amountInRaw.mul(feeDecimal).div(FEE_DENOMINATOR);
    const amountInAfterFee = amountInRaw.sub(feeAmount);

    let sqrtPNext: Decimal;

    // console.log('zeroForOne: ', zeroForOne);
    if (zeroForOne) {
        // Swapping token0 for token1 → price increases
        const numerator = amountInAfterFee.mul(Q96);
        // console.log('numerator: ', numerator.toString());
        // console.log('liquidity: ', liquidity.toString());
        // console.log('div: ', Number(numerator.toString()) / Number(liquidity.toString()));
        const delta = numerator.div(liquidity);
        // console.log('delta: ', delta);
        sqrtPNext = sqrtPriceX96.add(delta);
    } else {
        // Swapping token1 for token0 → price decreases
        const numerator = amountInAfterFee.mul(sqrtPriceX96).mul(sqrtPriceX96);
        const denominator = liquidity.mul(Q96);
        sqrtPNext = sqrtPriceX96.sub(numerator.div(denominator));
    }

    let amountOut: Decimal;

    if (zeroForOne) {
        const delta = sqrtPNext.sub(sqrtPriceX96);
        // console.log('sqrtPNext: ', sqrtPNext);
        // console.log('delta: ', delta);
        // console.log('delta: ', typeof delta);
        const numerator = liquidity.mul(Q96).mul(delta);
        // console.log('numerator: ', numerator);
        // console.log('numerator: ', typeof numerator);
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

// ==================== MAIN EXPORT FUNCTIONS ====================

/**
 * Gets swap quote for a given token pair and amount
 * This is the main function that orchestrates the quote calculation
 * 
 * @param tokenIn - Address of input token
 * @param tokenOut - Address of output token
 * @param amountIn - Amount of input token (in human-readable format)
 * @param factoryAddress - Address of the Uniswap V3 factory
 * @param rpcUrl - RPC URL for blockchain connection
 * @returns Promise<QuoteResult> - Complete quote information
 */
interface Token {
    address: string;
    decimals: number;
    symbol: string;
}
export interface PoolData {
    token0: Token;
    token1: Token;
    fee: number;
    poolAddress: string;
    slot0: any;
    sqrtPriceX96: string;
    liquidity: string;
}

interface QuoteParams {
    tokenIn: string;
    tokenOut: string;
    amountIn: number;
    factoryAddress: string;
    rpcUrl?: string;
}

export const getPoolContractInstance = (poolAddress: string, _provider = provider) => { return new Contract(poolAddress, POOL_ABI, _provider) }
export const getTokenDetails = async (tokenAddress: string, _provider = provider): Promise<Token> => {
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, _provider);
    const [decimals, symbol] = await Promise.all([
        tokenContract.decimals(),
        tokenContract.symbol(),
    ]);
    return {
        address: tokenAddress,
        decimals: Number(decimals),
        symbol: symbol,
    };
}

export const getPoolData = async (poolAddress: string, factoryAddress = FACTORY_ADDRESS.zerodex, _provider: ethers.Provider = provider): Promise<PoolData> => {
    const pool = new Contract(poolAddress, POOL_ABI, _provider);
    // Get current liquidity
    const liquidity: Decimal = new Decimal(await pool.liquidity())
    console.log('liquidity: ', liquidity);
    const slot0 = await pool.slot0();
    const token0Address = await pool.token0();
    const token1Address = await pool.token1();
    const fee = await pool.fee();

    const token0Contract = new Contract(token0Address, ERC20_ABI, _provider);
    const token1Contract = new Contract(token1Address, ERC20_ABI, _provider
    );
    const [decimals0, decimals1, symbol0, symbol1] = await Promise.all([
        token0Contract.decimals(),
        token1Contract.decimals(),
        token0Contract.symbol(),
        token1Contract.symbol(),
    ]);
    const token0: Token = {
        address: token0Address,
        decimals: Number(decimals0),
        symbol: symbol0,
    };
    const token1: Token = {
        address: token1Address,
        decimals: Number(decimals1),
        symbol: symbol1,
    };
    return {
        token0,
        token1,
        fee: Number(fee),
        poolAddress,
        slot0,
        sqrtPriceX96: slot0.sqrtPriceX96.toString(),
        liquidity: liquidity.toString()
    };
}

export interface ZeroDexQuoteParams {
    aToB: boolean; // true if swapping token0 for token1, false if swapping token1 for token0
    amountInFormattedInDecimal: Decimal; // Amount of input token in human-readable format
    pool: PoolData; // Pool data containing token metadata and liquidity
}
export function getAmountOut(
    params: ZeroDexQuoteParams
): QuoteResult {
    const { aToB, amountInFormattedInDecimal, pool } = params;
    const { liquidity, token0, token1, fee, poolAddress, sqrtPriceX96 } = pool;

    // console.log('slot0: ', slot0);

    // Get token metadata

    const tokenInObj = aToB ? token0 : token1;
    const tokenOutObj = aToB ? token1 : token0;

    const { decimals: decimalsIn, symbol: inSymbol } = tokenInObj
    const { decimals: decimalsOut } = tokenOutObj

    const decimalsInNum = Number(decimalsIn);
    const decimalsOutNum = Number(decimalsOut);

    const amountInRaw = new Decimal(amountInFormattedInDecimal);

    // Determine swap direction (zeroForOne = true if swapping token0 for token1)
    const zeroForOne = aToB
    // console.log('zeroForOne: ', zeroForOne);

    // Calculate swap output
    const { sqrtPNext, amountOut, feeAmount } = calculateSwapOutput({
        amountInRaw,
        sqrtPriceX96: new Decimal(sqrtPriceX96),
        liquidity: new Decimal(liquidity),
        fee,
        zeroForOne: !zeroForOne,
        decimalsIn: decimalsInNum,
        decimalsOut: decimalsOutNum,
    });

    // Calculate spot price

    const spotPrice = calculateSpotPrice(
        new Decimal(sqrtPriceX96),
        zeroForOne ? decimalsInNum : decimalsOutNum,
        zeroForOne ? decimalsOutNum : decimalsInNum,
        zeroForOne
    );



    return {
        price: spotPrice,
        amountIn: new Decimal(amountInFormattedInDecimal),
        amountOut,
        poolAddress,
        fee: feeAmount,
        sqrtPriceStart: new Decimal(sqrtPriceX96),
        sqrtPriceNext: new Decimal(sqrtPNext),
        liquidity: new Decimal(liquidity),
        tokenInDecimals: decimalsInNum,
        tokenOutDecimals: decimalsOutNum,
        zeroForOne,
    };
}


// ==================== FACTORY ADDRESSES ====================

/**
 * Known factory addresses for different DEXs
 */
export const FACTORY_ADDRESS = {
    zerodex: "0x7453582657F056ce5CfcEeE9E31E4BC390fa2b3c"
} as const;

// ==================== POOL DISCOVERY ====================

/**
 * Initializes and fetches all pool creation events from the factory
 * This function scans the blockchain for PoolCreated events to build a pool registry
 * 
 * @param factoryAddress - Address of the Uniswap V3 factory
 * @param fromBlockHeight - Starting block height for event scanning
 * @param rpcUrl - RPC URL for blockchain connection
 * @returns Promise<PoolCreatedEvent[]> - Array of pool creation events
 */

export const getAllPoolsFromEvents = async (
    factoryAddress: string,
    provider: JsonRpcProvider,
    fromBlockHeight: string = "171522",
) => {

    const factory = new Contract(factoryAddress, abi.abi, provider);

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

    const dataToWrite = {
        pools: pools,
        lastBlockNumber: pools[pools.length - 1].blockNumber,
    }

    //write to file
    fs.writeFileSync('pools.json', JSON.stringify(dataToWrite, null, 2));

    return pools;
}
export async function getAllPoolZeroDex(
    factoryAddress: string,
    fromBlockHeight: string = "171522",
    _provider: JsonRpcProvider = provider
): Promise<PoolData[]> {
    // Map events to a more convenient format
    const pools: PoolCreatedEvent[] = await getAllPoolsFromEvents(factoryAddress, _provider, fromBlockHeight,);
    // console.log('pools: ', pools);
    const poolsData: PoolData[] = []
    // TODO: use .map to make it faster, right now we can't because of the rpc rate limit
    let count = 0
    for (const pool of pools) {
        try {
            // Fetch pool data for each created pool
            const poolData = await getPoolData(pool.poolAddress);
            console.log('poolData: ', poolData.poolAddress);
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
export const wait = (time = 2) => {
    return new Promise((resolve) => setTimeout(resolve, time * 1000));
};


const fillerAllPoolsAndReturnOnePoolForEachPairWithTheHighestLiquidity =
    (allPool: PoolData[]) => {
        console.log('allPool: ', allPool.map(pool => pool.poolAddress));
        //return only the pool that has the highest liquidity for every token pair
        // the key of the map will be tokenX:tokenY
        const highestLiquidityMap = new Map<string, PoolData>();
        console.log('highestLiquidityMap: ', highestLiquidityMap);

        for (let i = 0; i < allPool.length; i++) {
            const pool = allPool[i];
            const xLiquidity = new Decimal(pool.liquidity);
            const key = `${pool.token0.address}:${pool.token1.address}`;
            // now we will check if the key is in the map
            if (highestLiquidityMap.has(key)) {
                const existingPool = highestLiquidityMap.get(key)!;
                const yLiquidity = new Decimal(existingPool.liquidity);
                if (
                    xLiquidity.gt(yLiquidity)) {
                    highestLiquidityMap.set(key, pool);
                }
            } else {
                highestLiquidityMap.set(key, pool);
            }
        }

        return Array.from(highestLiquidityMap.values());
    };



const RPC = "https://evmrpc-testnet.0g.ai";
const quoterAddress = "0x8d5E064d2EF44C29eE349e71CF70F751ECD62892";

export const simulateZeroGTransaction = async (tokenIn: string, tokenOut: string, amountIn: string, fee: number, sqrtPriceLimitX96 = "0") => {
    const provider = new ethers.JsonRpcProvider(RPC);

    const viewABI = [
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
    ];
    const quoter = new ethers.Contract(quoterAddress, viewABI, provider);
    try {
        const amountOut = await quoter.quoteExactInputSingle(
            tokenIn,
            tokenOut,
            fee,
            amountIn,
            sqrtPriceLimitX96
        );

        console.log("Amount Out:", amountOut.toString());
        return amountOut.toString();
    } catch (err: any) {
        console.error("Quote failed:", err);
    }
};

