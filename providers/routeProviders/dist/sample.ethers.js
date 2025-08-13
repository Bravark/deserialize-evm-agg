"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateZeroGTransaction = exports.wait = exports.getAllPoolsFromEvents = exports.FACTORY_ADDRESS = exports.getPoolData = exports.getTokenDetails = exports.getPoolContractInstance = exports.getTokenUsdPriceFromPool = exports.setPriceInPriceMap = exports.getPriceFromPriceMap = exports.priceMap = exports.provider = void 0;
exports.getSureTokenPrice = getSureTokenPrice;
exports.calculateSpotPrice = calculateSpotPrice;
exports.getAmountOut = getAmountOut;
exports.getAllPoolZeroDex = getAllPoolZeroDex;
const ethers_1 = require("ethers");
const abi = __importStar(require("../../zer0dexV3Factory.json"));
const fs_1 = __importDefault(require("fs"));
const decimal_js_1 = __importDefault(require("decimal.js"));
// ==================== CONSTANTS ====================
/**
 * Standard Uniswap V3 fee tiers
 * 100 = 0.01%, 500 = 0.05%, 3000 = 0.3%, 10000 = 1%
 */
const FEE_TIERS = [100, 500, 3000, 10000];
/**
 * Fee denominator for percentage calculations (10000 = 100%)
 */
const FEE_DENOMINATOR = new decimal_js_1.default(1000000); // Uniswap V3 uses 1e6 denominator for fees
/**
 * Q96 constant used in Uniswap V3 price calculations
 * Represents 2^96 for fixed-point arithmetic
 */
const Q96 = new decimal_js_1.default(2).pow(new decimal_js_1.default(96));
const RPC_URL = "https://evmrpc-testnet.0g.ai";
exports.provider = new ethers_1.JsonRpcProvider(RPC_URL);
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
];
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
];
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
];
// ==================== UTILITY FUNCTIONS ====================
/**
 * Fetches token price from CryptoCompare API
 * @param fsym - Token symbol (e.g., "ETH", "USDC")
 * @returns Promise<number> - Token price in USD
 */
async function getTokenPriceFromCryptoCompare(fsym) {
    const response = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${fsym}&tsyms=USD`);
    const data = await response.json();
    return data["USD"];
}
exports.priceMap = new Map();
const getPriceFromPriceMap = (tokenAddress) => {
    return exports.priceMap.get(tokenAddress);
};
exports.getPriceFromPriceMap = getPriceFromPriceMap;
const setPriceInPriceMap = (tokenAddress, price) => {
    exports.priceMap.set(tokenAddress, price);
};
exports.setPriceInPriceMap = setPriceInPriceMap;
async function getSureTokenPrice(tokenAddress, _provider = exports.provider) {
    // we should add the cache here
    try {
        const cachedPrice = (0, exports.getPriceFromPriceMap)(tokenAddress);
        if (cachedPrice !== undefined) {
            return cachedPrice;
        }
        const price = await (0, exports.getTokenUsdPriceFromPool)(tokenAddress, _provider);
        (0, exports.setPriceInPriceMap)(tokenAddress, price);
        return price;
    }
    catch (error) {
        console.error("Error fetching token price from pool using crypto compare....:");
    }
    const tokenData = await (0, exports.getTokenDetails)(tokenAddress, _provider);
    if (!tokenData) {
        throw new Error(`Token details not found for address: ${tokenAddress}`);
    }
    const tokenSymbol = tokenData.symbol.toUpperCase();
    console.log(`Fetching price for token: ${tokenSymbol}`);
    if (tokenSymbol.toLowerCase() === "usdt_v1")
        return 1; //for the custom USDT token
    const cPrice = await getTokenPriceFromCryptoCompare(tokenSymbol);
    (0, exports.setPriceInPriceMap)(tokenAddress, cPrice);
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
async function findBestPool(provider, tokenA, tokenB, factoryAddress) {
    // Create factory contract instance
    const factory = new ethers_1.Contract(factoryAddress, FACTORY_ABI, provider);
    let bestPool = null;
    // Iterate through all fee tiers to find the most liquid pool
    for (const fee of FEE_TIERS) {
        try {
            // Get pool address for this fee tier
            const poolAddress = await factory.getPool(tokenA, tokenB, fee);
            // Skip if pool doesn't exist (returns zero address)
            if (poolAddress === "0x0000000000000000000000000000000000000000") {
                continue;
            }
            // Create pool contract instance
            const pool = new ethers_1.Contract(poolAddress, POOL_ABI, provider);
            // Get current liquidity
            const liquidity = await pool.liquidity();
            // console.log('liquidity: ', liquidity);
            const slot0 = await pool.slot0();
            // console.log('slot0: ', slot0);
            // Update best pool if this one has higher liquidity
            if ((new decimal_js_1.default(liquidity)).gt(new decimal_js_1.default(0)) && (!bestPool || (new decimal_js_1.default(liquidity)).gt(bestPool.liquidity))) {
                bestPool = {
                    pool,
                    fee,
                    liquidity,
                    address: poolAddress,
                };
            }
        }
        catch (error) {
            console.log('error: ', error);
            throw new Error(`Error checking pool for fee ${fee}: ${error.message}`);
        }
    }
    if (!bestPool) {
        throw new Error("No viable pool found for token pair");
    }
    const poolData = await (0, exports.getPoolData)(bestPool.address);
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
function calculateSpotPrice(sqrtPriceX96, decimals0, decimals1, token0IsInput) {
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
const USDT_ADDRESS = "0x3eC8A8705bE1D5ca90066b37ba62c4183B024ebf";
const getTokenUsdPriceFromPool = async (tokenAddress, _provider = exports.provider, _poolData) => {
    //get the token and usdt pool
    let poolData = _poolData;
    if (!poolData) {
        const { poolData: __poolData } = await findBestPool(_provider, tokenAddress, USDT_ADDRESS, exports.FACTORY_ADDRESS.zerodex);
        poolData = __poolData;
    }
    const aToB = USDT_ADDRESS.toLowerCase() === poolData.token1.address.toLowerCase();
    return calculateSpotPrice(poolData.slot0.sqrtPriceX96, poolData.token0.decimals, poolData.token1.decimals, aToB);
};
exports.getTokenUsdPriceFromPool = getTokenUsdPriceFromPool;
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
function calculateSwapOutput({ amountInRaw, sqrtPriceX96, liquidity, fee, zeroForOne, decimalsIn, decimalsOut, }) {
    const feeDecimal = new decimal_js_1.default(fee);
    const feeAmount = amountInRaw.mul(feeDecimal).div(FEE_DENOMINATOR);
    const amountInAfterFee = amountInRaw.sub(feeAmount);
    let sqrtPNext;
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
    }
    else {
        // Swapping token1 for token0 → price decreases
        const numerator = amountInAfterFee.mul(sqrtPriceX96).mul(sqrtPriceX96);
        const denominator = liquidity.mul(Q96);
        sqrtPNext = sqrtPriceX96.sub(numerator.div(denominator));
    }
    let amountOut;
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
    }
    else {
        const delta = sqrtPriceX96.sub(sqrtPNext);
        amountOut = liquidity.mul(delta).div(Q96);
    }
    // Adjust for decimals
    let adjustedAmountOut = amountOut;
    if (decimalsIn > decimalsOut) {
        const diff = new decimal_js_1.default(10).pow(new decimal_js_1.default(decimalsIn - decimalsOut));
        adjustedAmountOut = amountOut.div(diff);
    }
    else if (decimalsOut > decimalsIn) {
        const diff = new decimal_js_1.default(10).pow(new decimal_js_1.default(decimalsOut - decimalsIn));
        adjustedAmountOut = amountOut.mul(diff);
    }
    return {
        amountOut: adjustedAmountOut,
        sqrtPNext,
        feeAmount,
        amountInAfterFee,
    };
}
const getPoolContractInstance = (poolAddress, _provider = exports.provider) => { return new ethers_1.Contract(poolAddress, POOL_ABI, _provider); };
exports.getPoolContractInstance = getPoolContractInstance;
const getTokenDetails = async (tokenAddress, _provider = exports.provider) => {
    const tokenContract = new ethers_1.Contract(tokenAddress, ERC20_ABI, _provider);
    const [decimals, symbol] = await Promise.all([
        tokenContract.decimals(),
        tokenContract.symbol(),
    ]);
    return {
        address: tokenAddress,
        decimals: Number(decimals),
        symbol: symbol,
    };
};
exports.getTokenDetails = getTokenDetails;
const getPoolData = async (poolAddress, factoryAddress = exports.FACTORY_ADDRESS.zerodex, _provider = exports.provider) => {
    const pool = new ethers_1.Contract(poolAddress, POOL_ABI, _provider);
    // Get current liquidity
    const liquidity = new decimal_js_1.default(await pool.liquidity());
    console.log('liquidity: ', liquidity);
    const slot0 = await pool.slot0();
    const token0Address = await pool.token0();
    const token1Address = await pool.token1();
    const fee = await pool.fee();
    const token0Contract = new ethers_1.Contract(token0Address, ERC20_ABI, _provider);
    const token1Contract = new ethers_1.Contract(token1Address, ERC20_ABI, _provider);
    const [decimals0, decimals1, symbol0, symbol1] = await Promise.all([
        token0Contract.decimals(),
        token1Contract.decimals(),
        token0Contract.symbol(),
        token1Contract.symbol(),
    ]);
    const token0 = {
        address: token0Address,
        decimals: Number(decimals0),
        symbol: symbol0,
    };
    const token1 = {
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
};
exports.getPoolData = getPoolData;
function getAmountOut(params) {
    const { aToB, amountInFormattedInDecimal, pool } = params;
    const { liquidity, token0, token1, fee, poolAddress, sqrtPriceX96 } = pool;
    // console.log('slot0: ', slot0);
    // Get token metadata
    const tokenInObj = aToB ? token0 : token1;
    const tokenOutObj = aToB ? token1 : token0;
    const { decimals: decimalsIn, symbol: inSymbol } = tokenInObj;
    const { decimals: decimalsOut } = tokenOutObj;
    const decimalsInNum = Number(decimalsIn);
    const decimalsOutNum = Number(decimalsOut);
    const amountInRaw = new decimal_js_1.default(amountInFormattedInDecimal);
    // Determine swap direction (zeroForOne = true if swapping token0 for token1)
    const zeroForOne = aToB;
    // console.log('zeroForOne: ', zeroForOne);
    // Calculate swap output
    const { sqrtPNext, amountOut, feeAmount } = calculateSwapOutput({
        amountInRaw,
        sqrtPriceX96: new decimal_js_1.default(sqrtPriceX96),
        liquidity: new decimal_js_1.default(liquidity),
        fee,
        zeroForOne: !zeroForOne,
        decimalsIn: decimalsInNum,
        decimalsOut: decimalsOutNum,
    });
    // Calculate spot price
    const spotPrice = calculateSpotPrice(new decimal_js_1.default(sqrtPriceX96), zeroForOne ? decimalsInNum : decimalsOutNum, zeroForOne ? decimalsOutNum : decimalsInNum, zeroForOne);
    return {
        price: spotPrice,
        amountIn: new decimal_js_1.default(amountInFormattedInDecimal),
        amountOut,
        poolAddress,
        fee: feeAmount,
        sqrtPriceStart: new decimal_js_1.default(sqrtPriceX96),
        sqrtPriceNext: new decimal_js_1.default(sqrtPNext),
        liquidity: new decimal_js_1.default(liquidity),
        tokenInDecimals: decimalsInNum,
        tokenOutDecimals: decimalsOutNum,
        zeroForOne,
    };
}
// ==================== FACTORY ADDRESSES ====================
/**
 * Known factory addresses for different DEXs
 */
exports.FACTORY_ADDRESS = {
    zerodex: "0x7453582657F056ce5CfcEeE9E31E4BC390fa2b3c"
};
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
const getAllPoolsFromEvents = async (factoryAddress, provider, fromBlockHeight = "171522") => {
    const factory = new ethers_1.Contract(factoryAddress, abi.abi, provider);
    const latestBlock = await provider.getBlockNumber();
    // Create filter for PoolCreated events
    // Event signature: PoolCreated(address,address,uint24,int24,int24,address)
    const filter = factory.filters.PoolCreated();
    // Get all PoolCreated events from the specified block range
    const events = await factory.queryFilter(filter, parseInt(fromBlockHeight), latestBlock);
    // Map events to a more convenient format
    const pools = events.map((event) => ({
        token0: event.args.token0,
        token1: event.args.token1,
        fee: event.args.fee.toString(),
        poolAddress: event.args.pool,
        blockNumber: event.blockNumber.toString(),
    }));
    const dataToWrite = {
        pools: pools,
        lastBlockNumber: pools[pools.length - 1].blockNumber,
    };
    //write to file
    fs_1.default.writeFileSync('pools.json', JSON.stringify(dataToWrite, null, 2));
    return pools;
};
exports.getAllPoolsFromEvents = getAllPoolsFromEvents;
async function getAllPoolZeroDex(factoryAddress, fromBlockHeight = "171522", _provider = exports.provider) {
    // Map events to a more convenient format
    const pools = await (0, exports.getAllPoolsFromEvents)(factoryAddress, _provider, fromBlockHeight);
    // console.log('pools: ', pools);
    const poolsData = [];
    // TODO: use .map to make it faster, right now we can't because of the rpc rate limit
    let count = 0;
    for (const pool of pools) {
        try {
            // Fetch pool data for each created pool
            const poolData = await (0, exports.getPoolData)(pool.poolAddress);
            console.log('poolData: ', poolData.poolAddress);
            poolsData.push(poolData);
        }
        catch (error) {
            console.log('error: ', error);
            console.error(`Error fetching data for pool ${pool.poolAddress}: ${error.message}`);
        }
        // if (count > 9) {
        //     await wait(5)
        //     count = 0
        // }
        await (0, exports.wait)(10);
    }
    // console.log('poolsData: ', poolsData);
    return poolsData; // no longer filtering by liquidity
}
const wait = (time = 2) => {
    return new Promise((resolve) => setTimeout(resolve, time * 1000));
};
exports.wait = wait;
const fillerAllPoolsAndReturnOnePoolForEachPairWithTheHighestLiquidity = (allPool) => {
    console.log('allPool: ', allPool.map(pool => pool.poolAddress));
    //return only the pool that has the highest liquidity for every token pair
    // the key of the map will be tokenX:tokenY
    const highestLiquidityMap = new Map();
    console.log('highestLiquidityMap: ', highestLiquidityMap);
    for (let i = 0; i < allPool.length; i++) {
        const pool = allPool[i];
        const xLiquidity = new decimal_js_1.default(pool.liquidity);
        const key = `${pool.token0.address}:${pool.token1.address}`;
        // now we will check if the key is in the map
        if (highestLiquidityMap.has(key)) {
            const existingPool = highestLiquidityMap.get(key);
            const yLiquidity = new decimal_js_1.default(existingPool.liquidity);
            if (xLiquidity.gt(yLiquidity)) {
                highestLiquidityMap.set(key, pool);
            }
        }
        else {
            highestLiquidityMap.set(key, pool);
        }
    }
    return Array.from(highestLiquidityMap.values());
};
const RPC = "https://evmrpc-testnet.0g.ai";
const quoterAddress = "0x8d5E064d2EF44C29eE349e71CF70F751ECD62892";
const simulateZeroGTransaction = async (tokenIn, tokenOut, amountIn, fee, sqrtPriceLimitX96 = "0") => {
    const provider = new ethers_1.ethers.JsonRpcProvider(RPC);
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
    const quoter = new ethers_1.ethers.Contract(quoterAddress, viewABI, provider);
    try {
        const amountOut = await quoter.quoteExactInputSingle(tokenIn, tokenOut, fee, amountIn, sqrtPriceLimitX96);
        console.log("Amount Out:", amountOut.toString());
        return amountOut.toString();
    }
    catch (err) {
        console.error("Quote failed:", err);
    }
};
exports.simulateZeroGTransaction = simulateZeroGTransaction;
