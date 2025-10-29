// /**
//  * Aerodrome V3 Quote Calculator Extension
//  * 
//  * Extends the UniswapV3QuoteCalculator to support Aerodrome V3 DEX
//  * Aerodrome V3 uses Uniswap V3's core logic with some modifications
//  */

// import { UniswapV3QuoteCalculator, DexConfig, ChainConfig, PoolCreatedEvent, PoolInfo, PoolData, QuoteResult } from "./UniswapV3Calculator";
// import { Contract, JsonRpcProvider } from "ethers";
// import { NetworkType } from "./constants";
// import Decimal from "decimal.js";

// // ==================== AERODROME V3 ABI DEFINITIONS ====================

// /**
//  * Aerodrome V3 Factory ABI
//  * Similar to Uniswap V3 but with Aerodrome-specific implementations
//  */
// export const AERODROME_V3_FACTORY_ABI = [
//     {
//         inputs: [
//             { internalType: "address", name: "tokenA", type: "address" },
//             { internalType: "address", name: "tokenB", type: "address" },
//             { internalType: "int24", name: "tickSpacing", type: "int24" }
//         ],
//         name: "getPool",
//         outputs: [{ internalType: "address", name: "pool", type: "address" }],
//         stateMutability: "view",
//         type: "function",
//     },
//     {
//         anonymous: false,
//         inputs: [
//             { indexed: true, internalType: "address", name: "token0", type: "address" },
//             { indexed: true, internalType: "address", name: "token1", type: "address" },
//             { indexed: true, internalType: "int24", name: "tickSpacing", type: "int24" },
//             { indexed: false, internalType: "address", name: "pool", type: "address" }
//         ],
//         name: "PoolCreated",
//         type: "event",
//     },
// ] as const;


// export const AERODROME_VPOOL_FACTORY_ABI = [{
//     "inputs": [
//         {
//             "internalType": "address",
//             "name": "tokenA",
//             "type": "address"
//         },
//         {
//             "internalType": "address",
//             "name": "tokenB",
//             "type": "address"
//         },
//         {
//             "internalType": "bool",
//             "name": "stable",
//             "type": "bool"
//         }
//     ],
//     "name": "getPool",
//     "outputs": [
//         {
//             "internalType": "address",
//             "name": "",
//             "type": "address"
//         }
//     ],
//     "stateMutability": "view",
//     "type": "function"
// }]

// export const AERODROME_VPOOL_ABI = [{
//     "inputs": [],
//     "name": "getReserves",
//     "outputs": [
//         {
//             "internalType": "uint256",
//             "name": "_reserve0",
//             "type": "uint256"
//         },
//         {
//             "internalType": "uint256",
//             "name": "_reserve1",
//             "type": "uint256"
//         },
//         {
//             "internalType": "uint256",
//             "name": "_blockTimestampLast",
//             "type": "uint256"
//         }
//     ],
//     "stateMutability": "view",
//     "type": "function"
// },
// {
//     "inputs": [],
//     "name": "token0",
//     "outputs": [
//         {
//             "internalType": "address",
//             "name": "",
//             "type": "address"
//         }
//     ],
//     "stateMutability": "view",
//     "type": "function"
// },
// {
//     "inputs": [],
//     "name": "token1",
//     "outputs": [
//         {
//             "internalType": "address",
//             "name": "",
//             "type": "address"
//         }
//     ],
//     "stateMutability": "view",
//     "type": "function"
// },]


// /**
//  * Aerodrome V3 Pool ABI
//  * Inherits from Uniswap V3 with additional features
//  */
// export const AERODROME_V3_POOL_ABI = [
//     {
//         inputs: [],
//         name: "liquidity",
//         outputs: [{ internalType: "uint128", name: "", type: "uint128" }],
//         stateMutability: "view",
//         type: "function",
//     },
//     {
//         inputs: [],
//         name: "slot0",
//         outputs: [
//             { internalType: "uint160", name: "sqrtPriceX96", type: "uint160" },
//             { internalType: "int24", name: "tick", type: "int24" },
//             { internalType: "uint16", name: "observationIndex", type: "uint16" },
//             { internalType: "uint16", name: "observationCardinality", type: "uint16" },
//             { internalType: "uint16", name: "observationCardinalityNext", type: "uint16" },
//             { internalType: "bool", name: "unlocked", type: "bool" }
//         ],
//         stateMutability: "view",
//         type: "function",
//     },
//     {
//         inputs: [],
//         name: "token0",
//         outputs: [{ internalType: "address", name: "", type: "address" }],
//         stateMutability: "view",
//         type: "function",
//     },
//     {
//         inputs: [],
//         name: "token1",
//         outputs: [{ internalType: "address", name: "", type: "address" }],
//         stateMutability: "view",
//         type: "function",
//     },
//     {
//         inputs: [],
//         name: "tickSpacing",
//         outputs: [{ internalType: "int24", name: "", type: "int24" }],
//         stateMutability: "view",
//         type: "function",
//     },
//     {
//         inputs: [],
//         name: "fee",
//         outputs: [{ internalType: "uint24", name: "", type: "uint24" }],
//         stateMutability: "view",
//         type: "function",
//     },
// ] as const;

// /**
//  * Aerodrome V3 Quoter ABI
//  */
// export const AERODROME_V3_QUOTER_ABI = [
//     {
//         "inputs": [
//             {
//                 "components": [
//                     {
//                         "internalType": "address",
//                         "name": "tokenIn",
//                         "type": "address"
//                     },
//                     {
//                         "internalType": "address",
//                         "name": "tokenOut",
//                         "type": "address"
//                     },
//                     {
//                         "internalType": "uint256",
//                         "name": "amountIn",
//                         "type": "uint256"
//                     },
//                     {
//                         "internalType": "int24",
//                         "name": "tickSpacing",
//                         "type": "int24"
//                     },
//                     {
//                         "internalType": "uint160",
//                         "name": "sqrtPriceLimitX96",
//                         "type": "uint160"
//                     }
//                 ],
//                 "internalType": "struct IQuoterV2.QuoteExactInputSingleParams",
//                 "name": "params",
//                 "type": "tuple"
//             }
//         ],
//         "name": "quoteExactInputSingle",
//         "outputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "amountOut",
//                 "type": "uint256"
//             },
//             {
//                 "internalType": "uint160",
//                 "name": "sqrtPriceX96After",
//                 "type": "uint160"
//             },
//             {
//                 "internalType": "uint32",
//                 "name": "initializedTicksCrossed",
//                 "type": "uint32"
//             },
//             {
//                 "internalType": "uint256",
//                 "name": "gasEstimate",
//                 "type": "uint256"
//             }
//         ],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
// ] as const;

// // ==================== AERODROME V3 CONSTANTS ====================

// /**
//  * Aerodrome V3 uses tick spacing instead of fee tiers
//  * Common tick spacings:
//  * - 1: 0.01% fee (lowest volatility pairs)
//  * - 50: 0.05% fee
//  * - 100: 0.30% fee (most common)
//  * - 200: 1.00% fee (exotic pairs)
//  */
// export const AERODROME_TICK_SPACINGS = [1, 50, 100, 200];

// const AERODROME_VPOOL_FACTORY = "0x420DD381b31aEf6683db6B902084cB0FFECe40Da"

// /**
//  * Fee calculation from tick spacing
//  * Aerodrome uses: fee = tickSpacing * 100
//  */
// export const calculateFeeFromTickSpacing = (tickSpacing: number): number => {
//     return tickSpacing * 100;
// };

// // ==================== AERODROME V3 NETWORK CONFIGS ====================



// // ==================== AERODROME V3 QUOTE CALCULATOR ====================

// export class AerodromeV3QuoteCalculator extends UniswapV3QuoteCalculator {
//     private tickSpacings: number[];

//     constructor(
//         config: DexConfig,
//         chainConfig: ChainConfig,
//         provider?: JsonRpcProvider,
//         tickSpacings: number[] = AERODROME_TICK_SPACINGS
//     ) {
//         // Use provided provider or create a new one
//         const rpcProvider = provider || new JsonRpcProvider(chainConfig.rpcUrl);

//         super(config, chainConfig, rpcProvider);
//         this.tickSpacings = tickSpacings;
//     }

//     /**
//      * Override findBestPool to use tick spacings instead of fee tiers
//      */
//     public async findBestPool(tokenA: string, tokenB: string) {
//         if (tokenA.toLowerCase() === this.config.nativeTokenAddress.toLowerCase()) {
//             tokenA = this.config.wrappedNativeTokenAddress;
//         }
//         if (tokenB.toLowerCase() === this.config.nativeTokenAddress.toLowerCase()) {
//             tokenB = this.config.wrappedNativeTokenAddress;
//         }
//         if (tokenA.toLowerCase() === tokenB.toLowerCase()) {
//             throw new Error("TokenA and TokenB cannot be the same");
//         }
//         const { Contract } = await import("ethers");
//         const factory = new Contract(
//             this.config.factoryAddress,
//             AERODROME_V3_FACTORY_ABI,
//             this.provider
//         );

//         let bestPool: any = null;

//         for (const tickSpacing of this.tickSpacings) {
//             try {
//                 const poolAddress: string = await factory.getPool(tokenA, tokenB, tickSpacing);

//                 if (poolAddress === "0x0000000000000000000000000000000000000000") {
//                     continue;
//                 }

//                 const pool = new Contract(poolAddress, AERODROME_V3_POOL_ABI, this.provider);
//                 const { Decimal } = await import("decimal.js");
//                 const liquidity = new Decimal((await pool.reserve0()).toString());

//                 if (liquidity.gt(0) && (!bestPool || liquidity.gt(bestPool.liquidity))) {
//                     const fee = calculateFeeFromTickSpacing(tickSpacing);
//                     bestPool = {
//                         pool,
//                         fee,
//                         liquidity,
//                         address: poolAddress,
//                     };
//                 }
//             } catch (error) {
//                 console.warn(`Error checking pool for tick spacing ${tickSpacing}:`, error);
//             }
//         }
//         //now to check the vPools for aerodrome
//         if (!bestPool) {
//             const vFactory = new Contract(AERODROME_VPOOL_FACTORY, AERODROME_VPOOL_FACTORY_ABI, this.provider)
//             const poolAddress = await vFactory.getPool(tokenA, tokenB, false)


//             console.log('poolAddress: ', poolAddress);
//             if (poolAddress === "0x0000000000000000000000000000000000000000") {
//                 throw new Error("still no pools on the vPools");
//             }
//             const pool = new Contract(poolAddress, AERODROME_V3_POOL_ABI, this.provider);
//             console.log('pool: ', pool);
//             const { Decimal } = await import("decimal.js");
//             const reserve0 = new Decimal((await pool.reserve0()).toString());
//             const reserve1 = new Decimal((await pool.reserve1()).toString());


//             const fee = pool.fee
//             bestPool = {
//                 pool,
//                 fee,
//                 liquidity: `${reserve0}:${reserve1}`,
//                 address: poolAddress,
//             };




//         }



//         if (!bestPool) {
//             throw new Error(`No viable Aerodrome pool found for token pair ${tokenA}/${tokenB}`);
//         }

//         const poolData = await this.getPoolData(bestPool.address);
//         return { ...bestPool, poolData };
//     }
//     public async findAllVPools(
//         tokenA: string,
//         tokenB: string,
//         feeTiers: number[]
//     ): Promise<(PoolInfo & { poolData: PoolData })[]> {
//         const factory = new Contract(AERODROME_VPOOL_FACTORY, AERODROME_VPOOL_FACTORY_ABI, this.provider);

//         // Normalize wrapped/native
//         if (tokenA.toLowerCase() === this.config.nativeTokenAddress.toLowerCase()) {
//             tokenA = this.config.wrappedNativeTokenAddress;
//         }
//         if (tokenB.toLowerCase() === this.config.nativeTokenAddress.toLowerCase()) {
//             tokenB = this.config.wrappedNativeTokenAddress;
//         }
//         if (tokenA.toLowerCase() === tokenB.toLowerCase()) {
//             throw new Error("TokenA and TokenB cannot be the same");
//         }
//         const getPools = async (isStable: boolean) => {
//             try {
//                 const poolAddress: string = await factory.getPool(tokenA, tokenB, isStable);

//                 // 🧠 Early skip for zero address
//                 if (
//                     !poolAddress ||
//                     poolAddress.toLowerCase() === "0x0000000000000000000000000000000000000000"
//                 ) {
//                     return null;
//                 }

//                 const pool = new Contract(poolAddress, AERODROME_V3_POOL_ABI, this.provider);
//                 console.log('pool: ', pool);
//                 const { Decimal } = await import("decimal.js");
//                 const reserve0 = new Decimal((await pool.reserve0()).toString());
//                 const reserve1 = new Decimal((await pool.reserve1()).toString());


//                 // only now fetch poolData since it's a heavier call
//                 const poolData = await this.getVPoolData(poolAddress);

//                 const res = {
//                     pool,
//                     fee: 0,
//                     //TODO: THIS IS VERY WRONG FACTOR THIS
//                     liquidity: `${reserve0}:${reserve1}` as any as Decimal,
//                     address: poolAddress,
//                     poolData,
//                 };


//                 return res;
//             } catch (error) {
//                 console.warn(`Error checking pool for isStable ${isStable} on DEX {${this.config.name}}`);
//                 return null;
//             }
//         }

//         const foundPools = await Promise.all([
//             await getPools(false),
//             await getPools(true)
//         ])

//         const clean = foundPools.filter((p): p is PoolInfo & { poolData: PoolData } => p !== null);
//         return clean;
//     }
//     private calculateStableSwapOutput(params: {
//         amountInRaw: Decimal;
//         reserveIn: Decimal;
//         reserveOut: Decimal;
//         decimalsIn: number;
//         decimalsOut: number;
//         token0Address: string;
//         tokenInAddress: string;
//     }): Decimal {
//         const {
//             amountInRaw,
//             reserveIn,
//             reserveOut,
//             decimalsIn,
//             decimalsOut,
//             token0Address,
//             tokenInAddress
//         } = params;

//         // Calculate xy (the invariant k)
//         const xy = this._k(reserveIn, reserveOut, decimalsIn, decimalsOut);

//         // Normalize reserves to 1e18
//         const reserve0Normalized = reserveIn.mul(Decimal.pow(10, 18)).div(Decimal.pow(10, decimalsIn));
//         const reserve1Normalized = reserveOut.mul(Decimal.pow(10, 18)).div(Decimal.pow(10, decimalsOut));

//         // Determine which reserve is A and which is B
//         const isToken0 = tokenInAddress.toLowerCase() === token0Address.toLowerCase();
//         const reserveA = isToken0 ? reserve0Normalized : reserve1Normalized;
//         const reserveB = isToken0 ? reserve1Normalized : reserve0Normalized;

//         // Normalize amountIn to 1e18
//         const amountInNormalized = amountInRaw.mul(Decimal.pow(10, 18)).div(Decimal.pow(10, decimalsIn));

//         // Calculate y using the stable swap curve
//         const y = reserveB.sub(this._get_y(amountInNormalized.add(reserveA), xy, reserveB));

//         // Denormalize back to token decimals
//         return y.mul(Decimal.pow(10, decimalsOut)).div(Decimal.pow(10, 18));
//     }
//     public getAmountOut(params: {
//         aToB: boolean;
//         amountInFormattedInDecimal: Decimal;
//         pool: PoolData;
//     }): QuoteResult {
//         const { aToB, amountInFormattedInDecimal, pool, } = params;
//         const { liquidity, fee, token0, token1, poolAddress } = pool;
//         const isStable = true
//         if (!liquidity.includes(":")) {
//             return super.getAmountOut({ aToB, amountInFormattedInDecimal, pool })
//         }
//         const [r0, r1] = liquidity.split(":")
//         const reserve0 = new Decimal(r0)
//         const reserve1 = new Decimal(r1)

//         const tokenInObj = aToB ? token0 : token1;
//         const tokenOutObj = aToB ? token1 : token0;
//         const decimalsIn = Number(tokenInObj.decimals);
//         const decimalsOut = Number(tokenOutObj.decimals);

//         // Convert to raw amounts
//         const amountInRaw = amountInFormattedInDecimal.mul(Decimal.pow(10, decimalsIn));

//         // Apply fee (fee is in basis points, e.g., 5 for 0.05%)
//         const feeMultiplier = new Decimal(10000).sub(fee).div(10000);
//         const amountInWithFee = amountInRaw.mul(feeMultiplier);

//         const reserveIn = aToB ? reserve0 : reserve1;
//         const reserveOut = aToB ? reserve1 : reserve0;

//         let amountOut: Decimal;

//         if (isStable) {
//             amountOut = this.calculateStableSwapOutput({
//                 amountInRaw: amountInWithFee,
//                 reserveIn,
//                 reserveOut,
//                 decimalsIn,
//                 decimalsOut,
//                 token0Address: token0.address.toLowerCase(),
//                 tokenInAddress: tokenInObj.address.toLowerCase(),
//             });
//         } else {
//             // Standard x*y=k formula (volatile pool)
//             amountOut = amountInWithFee.mul(reserveOut).div(reserveIn.add(amountInWithFee));
//         }

//         // Convert back to formatted decimals
//         const amountOutFormatted = amountOut.div(Decimal.pow(10, decimalsOut));

//         // Fee amount in input token
//         const feeAmount = amountInFormattedInDecimal.sub(
//             amountInWithFee.div(Decimal.pow(10, decimalsIn))
//         );

//         // Calculate spot price
//         const spotPrice = reserveIn.div(reserveOut).mul(
//             Decimal.pow(10, decimalsOut - decimalsIn)
//         );

//         return {
//             price: spotPrice.toNumber(),
//             amountIn: amountInFormattedInDecimal,
//             amountOut: amountOutFormatted,
//             poolAddress,
//             fee: feeAmount,
//             liquidity: reserve0.mul(reserve1).sqrt(),
//             tokenInDecimals: decimalsIn,
//             tokenOutDecimals: decimalsOut,
//             zeroForOne: aToB,
//             sqrtPriceStart: new Decimal(0),
//             sqrtPriceNext: new Decimal(0)
//         };
//     }
//     public async getVPoolData(poolAddress: string): Promise<PoolData> {
//         const cached = this.poolCache.get(poolAddress);
//         if (cached) {
//             return cached;
//         }

//         const pool = new Contract(poolAddress, AERODROME_VPOOL_ABI, this.provider);



//         const [[_reserve0, _reserve1], token0Address, token1Address,] = await Promise.all([
//             pool.getReserves(),
//             pool.token0(),
//             pool.token1(),
//         ]);

//         // console.log('token0Address: ', token0Address);
//         // console.log('token1Address: ', token1Address);
//         const [token0Details, token1Details] = await Promise.all([
//             this.getTokenDetails(token0Address),
//             this.getTokenDetails(token1Address),
//         ]);

//         const poolData: PoolData = {
//             token0: token0Details,
//             token1: token1Details,
//             fee: Number(0),
//             poolAddress,
//             slot0: "",
//             sqrtPriceX96: "",
//             liquidity: `${_reserve0}:${_reserve1}`,
//         };

//         this.poolCache.set(poolAddress, poolData);
//         return poolData;
//     }

//     public async getAllVPools(): Promise<PoolData[]> {
//         // Map events to a more convenient format
//         const pools: PoolCreatedEvent[] = await this.getAllVPoolsFromEvents(AERODROME_VPOOL_FACTORY, this.provider, "35006950", AERODROME_VPOOL_FACTORY_ABI);
//         console.log('pools: ', pools.length);
//         // console.log('pools: ', pools);
//         const poolsData: PoolData[] = []
//         // TODO: use .map to make it faster, right now we can't because of the rpc rate limit
//         let count = 0
//         for (const pool of pools) {
//             try {
//                 // Fetch pool data for each created pool
//                 const poolData = await this.getVPoolData(pool.poolAddress);
//                 console.log('poolData: ', poolData.poolAddress);
//                 poolData.blockNumber = pool.blockNumber.toString()
//                 poolsData.push(poolData);
//             } catch (error: any) {
//                 console.log('error: ', error);
//                 console.error(`Error fetching data for pool ${pool.poolAddress}: ${error.message}`);
//             }

//             // if (count > 9) {
//             //     await wait(5)
//             //     count = 0
//             // }
//             // await wait(10)
//         }

//         // console.log('poolsData: ', poolsData);
//         return poolsData // no longer filtering by liquidity
//     }
//     // Helper function to calculate k (invariant) for stable pools

//     /**
//      * Override getAllPools to use Aerodrome-specific event structure
//      */
//     public async getAllPools(abi = AERODROME_V3_FACTORY_ABI, fromBlock?: string) {
//         const poolData = await super.getAllPools(abi, fromBlock);
//         const vPoolData = await this.getAllVPools()

//         return { ...poolData, ...vPoolData }
//     }
//     async findAllPools(tokenA: string, tokenB: string, feeTiers?: number[]): Promise<(PoolInfo & { poolData: PoolData })[]> {
//         const foundPools = await super.findAllPools(tokenA, tokenB, feeTiers);
//         const vPools = await this.findAllVPools(tokenA, tokenB, [])

//         return { ...foundPools, ...vPools }
//     }

//     getAllVPoolsFromEvents = async (
//         factoryAddress: string,
//         provider: JsonRpcProvider,
//         fromBlockHeight: string = this.config.fromBlock || "0",
//         abi: any
//     ) => {
//         console.log("getting all the pools for chain: ", this.config.network, "rpc: ", this.chainConfig.rpcUrl, " provider rpc", provider._getConnection().url);
//         const factory = new Contract(factoryAddress, abi, provider);

//         const latestBlock = await provider.getBlockNumber();

//         // Create filter for PoolCreated events
//         // Event signature: PoolCreated(address,address,uint24,int24,int24,address)
//         const filter = factory.filters.PoolCreated();

//         // Get all PoolCreated events from the specified block range
//         const events = await factory.queryFilter(
//             filter,
//             parseInt(fromBlockHeight),
//             latestBlock
//         );

//         console.log('these are all the events fetched: ', events.length);

//         // Map events to a more convenient format
//         const pools: PoolCreatedEvent[] = events.map((event: any) => ({
//             token0: event.args.token0,
//             token1: event.args.token1,
//             fee: event.args.tickSpacing.toString(),
//             poolAddress: event.args.pool,
//             blockNumber: event.blockNumber.toString(),
//         }));

//         // const dataToWrite = {
//         //     pools: pools,
//         //     lastBlockNumber: pools[pools.length - 1].blockNumber,
//         // }


//         return pools;
//     }


//     /**
//      * Override simulateTransaction to use Aerodrome's quoter
//      */
//     public async simulateTransaction(
//         tokenIn: string,
//         tokenOut: string,
//         amountIn: string,
//         tickSpacing: number = 100,
//         sqrtPriceLimitX96: string = "0"
//     ): Promise<string> {
//         if (!this.config.quoterAddress) {
//             throw new Error("Quoter address not configured for Aerodrome");
//         }

//         const { Contract } = await import("ethers");
//         const quoter = new Contract(
//             this.config.quoterAddress,
//             AERODROME_V3_QUOTER_ABI,
//             this.provider
//         );

//         try {

//             const result = await quoter.quoteExactInputSingle.staticCall(
//                 { tokenIn, tokenOut, amountIn: BigInt(amountIn), tickSpacing, sqrtPriceLimitX96: BigInt(sqrtPriceLimitX96) }
//             );

//             return result.amountOut.toString(); // amountOut
//         } catch (error) {
//             console.error("Aerodrome quote simulation failed:", error);
//             return "0";
//         }
//     }

//     /**
//      * Get supported tick spacings
//      */
//     public getTickSpacings(): number[] {
//         return [...this.tickSpacings];
//     }

//     /**
//      * Add custom tick spacing
//      */
//     public addTickSpacing(tickSpacing: number): void {
//         if (!this.tickSpacings.includes(tickSpacing)) {
//             this.tickSpacings.push(tickSpacing);
//             this.tickSpacings.sort((a, b) => a - b);
//         }
//     }
//     private _k(x: Decimal, y: Decimal, decimals0: number, decimals1: number): Decimal {
//         const _x = x.mul(Decimal.pow(10, 18)).div(Decimal.pow(10, decimals0));
//         const _y = y.mul(Decimal.pow(10, 18)).div(Decimal.pow(10, decimals1));
//         const _a = _x.mul(_y).div(Decimal.pow(10, 18));
//         const _b = _x.mul(_x).div(Decimal.pow(10, 18)).add(_y.mul(_y).div(Decimal.pow(10, 18)));
//         return _a.mul(_b).div(Decimal.pow(10, 18)); // x3y+y3x >= k
//     }

//     // Helper function _f for Newton's method
//     private _f(x0: Decimal, y: Decimal): Decimal {
//         const _a = x0.mul(y).div(Decimal.pow(10, 18));
//         const _b = x0.mul(x0).div(Decimal.pow(10, 18)).add(y.mul(y).div(Decimal.pow(10, 18)));
//         return _a.mul(_b).div(Decimal.pow(10, 18));
//     }

//     // Helper function _d for Newton's method (derivative)
//     private _d(x0: Decimal, y: Decimal): Decimal {
//         const three = new Decimal(3);
//         const term1 = three.mul(x0).mul(y.mul(y).div(Decimal.pow(10, 18))).div(Decimal.pow(10, 18));
//         const term2 = x0.mul(x0).div(Decimal.pow(10, 18)).mul(x0).div(Decimal.pow(10, 18));
//         return term1.add(term2);
//     }

//     // Newton's method to find y given x0 and xy (the invariant)
//     private _get_y(x0: Decimal, xy: Decimal, y: Decimal): Decimal {
//         for (let i = 0; i < 255; i++) {
//             const k = this._f(x0, y);

//             if (k.lt(xy)) {
//                 const numerator = xy.sub(k).mul(Decimal.pow(10, 18));
//                 const denominator = this._d(x0, y);
//                 let dy = numerator.div(denominator);

//                 if (dy.eq(0)) {
//                     if (k.eq(xy)) {
//                         return y;
//                     }
//                     if (this._k_simple(x0, y.add(1)).gt(xy)) {
//                         return y.add(1);
//                     }
//                     dy = new Decimal(1);
//                 }
//                 y = y.add(dy);
//             } else {
//                 const numerator = k.sub(xy).mul(Decimal.pow(10, 18));
//                 const denominator = this._d(x0, y);
//                 let dy = numerator.div(denominator);

//                 if (dy.eq(0)) {
//                     if (k.eq(xy) || this._f(x0, y.sub(1)).lt(xy)) {
//                         return y;
//                     }
//                     dy = new Decimal(1);
//                 }
//                 y = y.sub(dy);
//             }
//         }
//         throw new Error("Newton's method did not converge for _get_y");
//     }

//     // Simplified k calculation for convergence checks
//     private _k_simple(x0: Decimal, y: Decimal): Decimal {
//         return this._f(x0, y);
//     }
// }

// // ==================== USAGE EXAMPLE ====================



