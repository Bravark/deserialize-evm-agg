// /**
//  * PancakeSwap V2 Quote Calculator
//  * Uses constant product formula (x * y = k) instead of concentrated liquidity
//  */

// import { ethers, Contract, JsonRpcProvider } from "ethers";
// import Decimal from "decimal.js";
// import { NetworkType } from "deserialize-evm-server-sdk";
// import { Token } from "./type";
// import { ERC20_ABI } from "./UniswapV3Calculator";

// // ==================== TYPES ====================

// export interface PancakeSwapV2Config {
//     name: string;
//     network: NetworkType;
//     factoryAddress: string;
//     routerAddress: string;
//     wrappedNativeTokenAddress: string;
//     nativeTokenAddress: string;
//     stableTokenAddress?: string;
//     fromBlock?: string;
// }

// export interface PairData {
//     pairAddress: string;
//     token0: Token;
//     token1: Token;
//     reserve0: string;
//     reserve1: string;
//     blockTimestampLast: number;
// }

// export interface V2QuoteResult {
//     amountOut: Decimal;
//     amountIn: Decimal;
//     price: number;
//     priceImpact: number;
//     pairAddress: string;
//     reserve0: Decimal;
//     reserve1: Decimal;
//     path: string[];
// }

// // ==================== CONSTANTS ====================

// const PANCAKESWAP_V2_FEE = 9975; // 0.25% fee (10000 - 25)
// const FEE_DENOMINATOR = 10000;

// // ==================== PANCAKESWAP V2 ABIS ====================

// export const PANCAKESWAP_V2_FACTORY_ABI = [
//     {
//         constant: true,
//         inputs: [
//             { internalType: "address", name: "", type: "address" },
//             { internalType: "address", name: "", type: "address" },
//         ],
//         name: "getPair",
//         outputs: [{ internalType: "address", name: "", type: "address" }],
//         payable: false,
//         stateMutability: "view",
//         type: "function",
//     },
//     {
//         anonymous: false,
//         inputs: [
//             { indexed: true, internalType: "address", name: "token0", type: "address" },
//             { indexed: true, internalType: "address", name: "token1", type: "address" },
//             { indexed: false, internalType: "address", name: "pair", type: "address" },
//             { indexed: false, internalType: "uint256", name: "", type: "uint256" },
//         ],
//         name: "PairCreated",
//         type: "event",
//     },
//     {
//         constant: true,
//         inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//         name: "allPairs",
//         outputs: [{ internalType: "address", name: "", type: "address" }],
//         payable: false,
//         stateMutability: "view",
//         type: "function",
//     },
//     {
//         constant: true,
//         inputs: [],
//         name: "allPairsLength",
//         outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//         payable: false,
//         stateMutability: "view",
//         type: "function",
//     },
// ] as const;

// export const PANCAKESWAP_V2_PAIR_ABI = [
//     {
//         constant: true,
//         inputs: [],
//         name: "getReserves",
//         outputs: [
//             { internalType: "uint112", name: "_reserve0", type: "uint112" },
//             { internalType: "uint112", name: "_reserve1", type: "uint112" },
//             { internalType: "uint32", name: "_blockTimestampLast", type: "uint32" },
//         ],
//         payable: false,
//         stateMutability: "view",
//         type: "function",
//     },
//     {
//         constant: true,
//         inputs: [],
//         name: "token0",
//         outputs: [{ internalType: "address", name: "", type: "address" }],
//         payable: false,
//         stateMutability: "view",
//         type: "function",
//     },
//     {
//         constant: true,
//         inputs: [],
//         name: "token1",
//         outputs: [{ internalType: "address", name: "", type: "address" }],
//         payable: false,
//         stateMutability: "view",
//         type: "function",
//     },
// ] as const;

// export const PANCAKESWAP_V2_ROUTER_ABI = [
//     {
//         inputs: [
//             { internalType: "uint256", name: "amountIn", type: "uint256" },
//             { internalType: "address[]", name: "path", type: "address[]" },
//         ],
//         name: "getAmountsOut",
//         outputs: [{ internalType: "uint256[]", name: "amounts", type: "uint256[]" }],
//         stateMutability: "view",
//         type: "function",
//     },
// ] as const;

// // ==================== CHAIN CONFIGURATIONS ====================

// export const PANCAKESWAP_V2_CONFIGS: Record<string, PancakeSwapV2Config> = {
//     BSC: {
//         name: "PancakeSwap V2",
//         network: NetworkType.BSC,
//         factoryAddress: "0xcA143Ce32FE78f1f7019d7d551a6402fC5350c73",
//         routerAddress: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
//         wrappedNativeTokenAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
//         nativeTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
//         stableTokenAddress: "0x55d398326f99059fF775485246999027B3197955", // USDT
//         fromBlock: "6810080", // PancakeSwap V2 deployment
//     },
// };

// // ==================== PANCAKESWAP V2 CALCULATOR CLASS ====================

// export class PancakeSwapV2Calculator {
//     private provider: JsonRpcProvider;
//     private config: PancakeSwapV2Config;
//     private pairCache: Map<string, PairData>;
//     private priceCache: Map<string, { price: number; timestamp: number }>;
//     private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

//     constructor(config: PancakeSwapV2Config, provider: JsonRpcProvider) {
//         this.config = config;
//         this.provider = provider;
//         this.pairCache = new Map();
//         this.priceCache = new Map();
//     }

//     // ==================== TOKEN METHODS ====================

//     public async getTokenDetails(tokenAddress: string): Promise<Token> {
//         if (tokenAddress.toLowerCase() === this.config.nativeTokenAddress.toLowerCase()) {
//             tokenAddress = this.config.wrappedNativeTokenAddress;
//         }

//         const cacheKey = `token_${tokenAddress}`;
//         const cached = this.pairCache.get(cacheKey);
//         if (cached) {
//             return cached as any;
//         }

//         const tokenContract = new Contract(tokenAddress, ERC20_ABI, this.provider);
//         const [decimals, symbol, name] = await Promise.all([
//             tokenContract.decimals(),
//             tokenContract.symbol(),
//             tokenContract.name(),
//         ]);

//         return {
//             address: tokenAddress,
//             decimals: Number(decimals),
//             symbol,
//             name,
//         };
//     }

//     // ==================== PAIR METHODS ====================

//     public async getPairAddress(tokenA: string, tokenB: string): Promise<string> {
//         const factory = new Contract(
//             this.config.factoryAddress,
//             PANCAKESWAP_V2_FACTORY_ABI,
//             this.provider
//         );

//         const pairAddress = await factory.getPair(tokenA, tokenB);

//         if (pairAddress === "0x0000000000000000000000000000000000000000") {
//             throw new Error(`No pair exists for ${tokenA}/${tokenB}`);
//         }

//         return pairAddress;
//     }

//     public async getPairData(pairAddress: string): Promise<PairData> {
//         const cached = this.pairCache.get(pairAddress);
//         if (cached) {
//             return cached;
//         }

//         const pair = new Contract(pairAddress, PANCAKESWAP_V2_PAIR_ABI, this.provider);

//         const [reserves, token0Address, token1Address] = await Promise.all([
//             pair.getReserves(),
//             pair.token0(),
//             pair.token1(),
//         ]);

//         const [token0Details, token1Details] = await Promise.all([
//             this.getTokenDetails(token0Address),
//             this.getTokenDetails(token1Address),
//         ]);

//         const pairData: PairData = {
//             pairAddress,
//             token0: token0Details,
//             token1: token1Details,
//             reserve0: reserves[0].toString(),
//             reserve1: reserves[1].toString(),
//             blockTimestampLast: Number(reserves[2]),
//         };

//         this.pairCache.set(pairAddress, pairData);
//         return pairData;
//     }

//     // ==================== CALCULATION METHODS ====================

//     /**
//      * Calculate amount out using the constant product formula: x * y = k
//      * Formula: amountOut = (amountIn * 9975 * reserveOut) / (reserveIn * 10000 + amountIn * 9975)
//      */
//     private calculateAmountOut(
//         amountIn: Decimal,
//         reserveIn: Decimal,
//         reserveOut: Decimal
//     ): Decimal {
//         if (amountIn.lte(0)) {
//             throw new Error("Amount in must be greater than 0");
//         }
//         if (reserveIn.lte(0) || reserveOut.lte(0)) {
//             throw new Error("Insufficient liquidity");
//         }

//         const amountInWithFee = amountIn.mul(PANCAKESWAP_V2_FEE);
//         const numerator = amountInWithFee.mul(reserveOut);
//         const denominator = reserveIn.mul(FEE_DENOMINATOR).add(amountInWithFee);

//         return numerator.div(denominator);
//     }

//     /**
//      * Calculate price impact as a percentage
//      */
//     private calculatePriceImpact(
//         amountIn: Decimal,
//         amountOut: Decimal,
//         reserveIn: Decimal,
//         reserveOut: Decimal
//     ): number {
//         // Spot price before swap
//         const spotPriceBefore = reserveOut.div(reserveIn);

//         // Effective price of this swap
//         const effectivePrice = amountOut.div(amountIn);

//         // Price impact as percentage
//         const priceImpact = spotPriceBefore
//             .sub(effectivePrice)
//             .div(spotPriceBefore)
//             .mul(100);

//         return priceImpact.toNumber();
//     }

//     // ==================== QUOTE METHODS ====================

//     public async getQuote(
//         tokenIn: string,
//         tokenOut: string,
//         amountIn: number | string | Decimal
//     ): Promise<V2QuoteResult> {
//         // Normalize addresses
//         if (tokenIn.toLowerCase() === this.config.nativeTokenAddress.toLowerCase()) {
//             tokenIn = this.config.wrappedNativeTokenAddress;
//         }
//         if (tokenOut.toLowerCase() === this.config.nativeTokenAddress.toLowerCase()) {
//             tokenOut = this.config.wrappedNativeTokenAddress;
//         }

//         const pairAddress = await this.getPairAddress(tokenIn, tokenOut);
//         const pairData = await this.getPairData(pairAddress);

//         const amountInDecimal = new Decimal(amountIn.toString());

//         // Determine which token is token0 and which is token1
//         const token0IsInput = tokenIn.toLowerCase() === pairData.token0.address.toLowerCase();

//         const reserveIn = new Decimal(token0IsInput ? pairData.reserve0 : pairData.reserve1);
//         const reserveOut = new Decimal(token0IsInput ? pairData.reserve1 : pairData.reserve0);

//         // Calculate output amount
//         const amountOut = this.calculateAmountOut(amountInDecimal, reserveIn, reserveOut);

//         // Calculate price and price impact
//         const price = amountOut.div(amountInDecimal).toNumber();
//         const priceImpact = this.calculatePriceImpact(
//             amountInDecimal,
//             amountOut,
//             reserveIn,
//             reserveOut
//         );

//         return {
//             amountOut,
//             amountIn: amountInDecimal,
//             price,
//             priceImpact,
//             pairAddress,
//             reserve0: new Decimal(pairData.reserve0),
//             reserve1: new Decimal(pairData.reserve1),
//             path: [tokenIn, tokenOut],
//         };
//     }

//     /**
//      * Get quote using router for multi-hop swaps
//      */
//     public async getQuoteFromRouter(
//         path: string[],
//         amountIn: string
//     ): Promise<string[]> {
//         const router = new Contract(
//             this.config.routerAddress,
//             PANCAKESWAP_V2_ROUTER_ABI,
//             this.provider
//         );

//         try {
//             const amounts = await router.getAmountsOut(BigInt(amountIn), path);
//             return amounts.map((amount: bigint) => amount.toString());
//         } catch (error) {
//             console.error("Router quote failed:", error);
//             throw error;
//         }
//     }

//     // ==================== POOL DISCOVERY ====================

//     public async getAllPairs(): Promise<PairData[]> {
//         const factory = new Contract(
//             this.config.factoryAddress,
//             PANCAKESWAP_V2_FACTORY_ABI,
//             this.provider
//         );

//         const pairsLength = await factory.allPairsLength();
//         const pairs: PairData[] = [];

//         console.log(`Total pairs: ${pairsLength}`);

//         // Fetch pairs in batches to avoid rate limiting
//         const batchSize = 50;
//         for (let i = 0; i < Number(pairsLength); i += batchSize) {
//             const batch = Math.min(batchSize, Number(pairsLength) - i);
//             const promises = Array.from({ length: batch }, (_, j) =>
//                 factory.allPairs(i + j)
//             );

//             const pairAddresses = await Promise.all(promises);

//             for (const pairAddress of pairAddresses) {
//                 try {
//                     const pairData = await this.getPairData(pairAddress);
//                     pairs.push(pairData);
//                 } catch (error) {
//                     console.error(`Error fetching pair ${pairAddress}:`, error);
//                 }
//             }

//             // Rate limiting
//             await this.wait(0.5);
//         }

//         return pairs;
//     }

//     // ==================== UTILITY METHODS ====================

//     private async wait(seconds: number = 2): Promise<void> {
//         return new Promise(resolve => setTimeout(resolve, seconds * 1000));
//     }

//     private isCacheValid(timestamp: number): boolean {
//         return Date.now() - timestamp < this.CACHE_DURATION;
//     }

//     public getConfig(): PancakeSwapV2Config {
//         return { ...this.config };
//     }

//     public getProvider(): JsonRpcProvider {
//         return this.provider;
//     }

//     public clearCache(): void {
//         this.pairCache.clear();
//         this.priceCache.clear();
//     }

//     public setCacheTimeout(durationMs: number): void {
//         // @ts-ignore
//         this.CACHE_DURATION = durationMs;
//     }
// }

// // ==================== HELPER FUNCTIONS ====================

// /**
//  * Create a PancakeSwap V2 calculator instance
//  */
// export function createPancakeSwapV2Calculator(
//     network: keyof typeof PANCAKESWAP_V2_CONFIGS,
//     rpcUrl: string
// ): PancakeSwapV2Calculator {
//     const config = PANCAKESWAP_V2_CONFIGS[network];
//     if (!config) {
//         throw new Error(`Unsupported network: ${network}`);
//     }
//     const provider = new JsonRpcProvider(rpcUrl);
//     return new PancakeSwapV2Calculator(config, provider);
// }

// /**
//  * Get available networks for PancakeSwap V2
//  */
// export function getAvailablePancakeSwapV2Networks(): string[] {
//     return Object.keys(PANCAKESWAP_V2_CONFIGS);
// }