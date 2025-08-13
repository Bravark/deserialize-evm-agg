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
import { ethers, JsonRpcProvider } from "ethers";
import Decimal from "decimal.js";
/**
 * Quote result containing all relevant swap information
 */
interface QuoteResult {
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
/**
 * Pool creation event data
 */
interface PoolCreatedEvent {
    token0: string;
    token1: string;
    fee: string;
    poolAddress: string;
    blockNumber: number;
}
export declare const provider: ethers.JsonRpcProvider;
export declare const priceMap: Map<string, number>;
export declare const getPriceFromPriceMap: (tokenAddress: string) => number | undefined;
export declare const setPriceInPriceMap: (tokenAddress: string, price: number) => void;
export declare function getSureTokenPrice(tokenAddress: string, _provider?: ethers.JsonRpcProvider): Promise<number>;
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
export declare function calculateSpotPrice(sqrtPriceX96: Decimal, decimals0: number, decimals1: number, token0IsInput: boolean): number;
export declare const getTokenUsdPriceFromPool: (tokenAddress: string, _provider?: ethers.JsonRpcProvider, _poolData?: PoolData) => Promise<number>;
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
export declare const getPoolContractInstance: (poolAddress: string, _provider?: ethers.JsonRpcProvider) => ethers.Contract;
export declare const getTokenDetails: (tokenAddress: string, _provider?: ethers.JsonRpcProvider) => Promise<Token>;
export declare const getPoolData: (poolAddress: string, factoryAddress?: "0x7453582657F056ce5CfcEeE9E31E4BC390fa2b3c", _provider?: ethers.Provider) => Promise<PoolData>;
export interface ZeroDexQuoteParams {
    aToB: boolean;
    amountInFormattedInDecimal: Decimal;
    pool: PoolData;
}
export declare function getAmountOut(params: ZeroDexQuoteParams): QuoteResult;
/**
 * Known factory addresses for different DEXs
 */
export declare const FACTORY_ADDRESS: {
    readonly zerodex: "0x7453582657F056ce5CfcEeE9E31E4BC390fa2b3c";
};
/**
 * Initializes and fetches all pool creation events from the factory
 * This function scans the blockchain for PoolCreated events to build a pool registry
 *
 * @param factoryAddress - Address of the Uniswap V3 factory
 * @param fromBlockHeight - Starting block height for event scanning
 * @param rpcUrl - RPC URL for blockchain connection
 * @returns Promise<PoolCreatedEvent[]> - Array of pool creation events
 */
export declare const getAllPoolsFromEvents: (factoryAddress: string, provider: JsonRpcProvider, fromBlockHeight?: string) => Promise<PoolCreatedEvent[]>;
export declare function getAllPoolZeroDex(factoryAddress: string, fromBlockHeight?: string, _provider?: JsonRpcProvider): Promise<PoolData[]>;
export declare const wait: (time?: number) => Promise<unknown>;
export declare const simulateZeroGTransaction: (tokenIn: string, tokenOut: string, amountIn: string, fee: number, sqrtPriceLimitX96?: string) => Promise<any>;
export {};
