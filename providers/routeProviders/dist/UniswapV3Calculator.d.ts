/**
 * Uniswap V3 Quote Calculator - Reusable Class Version
 *
 * A generic class for calculating swap quotes on any Uniswap V3 compatible DEX.
 * Supports multiple networks and can be easily extended for different protocols.
 */
import { ethers, Contract, JsonRpcProvider } from "ethers";
import Decimal from "decimal.js";
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
    blockNumber?: string;
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
    abi: any;
    wrappedNativeTokenAddress: string;
    stableTokenAddress?: string;
}
export interface QuoteParams {
    tokenIn: string;
    tokenOut: string;
    amountIn: number;
    aToB?: boolean;
    amountInFormattedInDecimal?: Decimal;
    pool?: PoolData;
}
export declare class UniswapV3QuoteCalculator {
    private provider;
    private config;
    private priceCache;
    private poolCache;
    private readonly CACHE_DURATION;
    constructor(config: DexConfig, provider: JsonRpcProvider);
    getPriceFromPriceMap: (tokenAddress: string) => number | undefined;
    setPriceInPriceMap: (tokenAddress: string, price: number) => void;
    getSureTokenPrice(tokenAddress: string, _provider?: ethers.JsonRpcProvider): Promise<number>;
    private wait;
    private isCacheValid;
    getTokenDetails(tokenAddress: string, provider?: ethers.JsonRpcProvider): Promise<Token>;
    getTokenPrice(tokenAddress: string): Promise<number>;
    private getTokenPriceFromExternalAPI;
    private getTokenUsdPriceFromPoolUsingStableCoin;
    getTokenUsdPriceFromPoolWrappedToken(tokenAddress: string): Promise<number>;
    private getTokenUsdPriceFromPool;
    getPoolData(poolAddress: string): Promise<PoolData>;
    findBestPool(tokenA: string, tokenB: string): Promise<PoolInfo & {
        poolData: PoolData;
    }>;
    calculateSpotPrice(sqrtPriceX96: Decimal, decimals0: number, decimals1: number, token0IsInput: boolean): number;
    private calculateSwapOutput;
    getQuote(params: QuoteParams): Promise<QuoteResult>;
    getAmountOut(params: {
        aToB: boolean;
        amountInFormattedInDecimal: Decimal;
        pool: PoolData;
    }): QuoteResult;
    simulateTransaction(tokenIn: string, tokenOut: string, amountIn: string, fee: number, sqrtPriceLimitX96?: string): Promise<string>;
    /**
     * Initializes and fetches all pool creation events from the factory
     * This function scans the blockchain for PoolCreated events to build a pool registry
     *
     * @param factoryAddress - Address of the Uniswap V3 factory
     * @param fromBlockHeight - Starting block height for event scanning
     * @param provider - blockchain connection
     * @returns Promise<PoolCreatedEvent[]> - Array of pool creation events
     */
    getAllPoolsFromEvents: (factoryAddress: string, provider: JsonRpcProvider, fromBlockHeight: string | undefined, abi: any) => Promise<PoolCreatedEvent[]>;
    getAllPools(abi: any, fromBlock?: string): Promise<PoolData[]>;
    getConfig(): DexConfig;
    getProvider(): JsonRpcProvider;
    clearCache(): void;
    setCacheTimeout(durationMs: number): void;
}
export declare const DEX_CONFIGS: {
    readonly ZERODEX_TESTNET: {
        readonly name: "ZeroDEX Testnet";
        readonly factoryAddress: "0x7453582657F056ce5CfcEeE9E31E4BC390fa2b3c";
        readonly quoterAddress: "0x8d5E064d2EF44C29eE349e71CF70F751ECD62892";
        readonly rpcUrl: "https://evmrpc-testnet.0g.ai";
        readonly fromBlock: 171522;
        readonly stableTokenAddress: "0x3eC8A8705bE1D5ca90066b37ba62c4183B024ebf";
    };
    readonly UNISWAP_V3_MAINNET: {
        readonly name: "Uniswap V3 Mainnet";
        readonly factoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984";
        readonly quoterAddress: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
        readonly rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY";
        readonly stableTokenAddress: "0xA0b86a33E6441b8d6c6e4fC6F120d4d5A1b9A651";
    };
};
export declare const wait: (time?: number) => Promise<unknown>;
