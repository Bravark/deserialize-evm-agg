import { AERODROME_BASE_CONFIG, PANCAKE_BASE_CONFIG, UNISWAP_V3_BASE_CONFIG, UniswapV3QuoteCalculator } from "@deserialize-evm-agg/routes-providers";
import { AerodromeV3QuoteCalculator } from "@deserialize-evm-agg/routes-providers/Aerodromev3Calculator";
import { chain } from "@deserialize-evm-agg/routes-providers/base/chain";
import { PancakeSwapV3Calculator } from "@deserialize-evm-agg/routes-providers/PancakeSwapV3Calculator";
import { UniswapV3QuoteCalculatorV2 } from "@deserialize-evm-agg/routes-providers/UniswapV3CalculatorV2";
import { ethers } from "ethers";
import fs from "fs";

async function testMultiRouteSwap() {
    // -----------------------------
    // 1️⃣ Setup provider and signer
    // -----------------------------
    const RPC_URL = chain.rpcUrl; // change as needed
    const PRIVATE_KEY = "0xcd90354282b35344616d6b53684684bef6e8673ed601d562a5866dc67fafd1ef"; // replace with a funded testnet wallet

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    // -----------------------------
    // 2️⃣ Load contract ABI & address
    // -----------------------------
    const contractAddress = "0xADb0018bCF10b7dD84B7C3e2D92889185DA41f45";
    const abi = JSON.parse(fs.readFileSync("./MultiRouteSwapV2ABI.json", "utf8")); // or paste ABI inline
    // console.log('abi: ', abi);

    const contract = new ethers.Contract(contractAddress, abi, signer);

    // -----------------------------
    // 3️⃣ Define parameters
    // -----------------------------
    const uniswapAdapter = "0x4001564cf4e1DBBaA20e7E24be51abaf2eaA4d3B"; // Uniswap adapter you mentioned
    const aerodromeAdaptor = "0xEA81B9CcFBF6053B33429f103D11dc7a060f7869"
    const pacakeswapAdapter = "0x27DfBFcE2a4AAa2a08DDcD71Ad298AcFD81AE4Dc"; // PancakeSwap adapter you mentioned


    // Construct one-hop swap
    const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // mainnet WETH; replace with testnet if needed
    //getting the pool to use 
    const tokenA = chain.nativeTokenAddress; // ETH constant
    const tokenB = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base
    // const uniswapCalculator = new UniswapV3QuoteCalculatorV2(UNISWAP_V3_BASE_CONFIG, chain)
    // const uniswapPool = await uniswapCalculator.findBestPool(tokenA, tokenB)

    const aerodromeCalculator = new AerodromeV3QuoteCalculator(AERODROME_BASE_CONFIG, chain)
    const aerodromePool = await aerodromeCalculator.findBestPool(tokenA, tokenB)

    const pancakeswapCalculator = new PancakeSwapV3Calculator(PANCAKE_BASE_CONFIG, chain)
    const pancakeswapPool = await pancakeswapCalculator.findBestPool(tokenA, tokenB)
    const hop = {
        tokenIn: tokenA,
        tokenOut: tokenB,
        adapter: pacakeswapAdapter,
        poolAddress: pancakeswapPool.address,
        sqrtPriceLimitX96: 0n
    };

    // Partner settings
    const partnerSettings = {
        partnerFee: 100, // 1% = 100 / 10000
        feeRecepient: signer.address
    };

    // -----------------------------
    // 4️⃣ Execute the swap
    // -----------------------------
    const firstAmountIn = ethers.parseEther("0.0003"); // sending 0.0001 ETH
    const minAmountOut = "1000000"; // expect at least 0.009 WETH

    console.log("💱 Executing swap...");

    const tx = await contract.swap(
        [hop],
        firstAmountIn,
        minAmountOut,
        partnerSettings,
        {
            value: firstAmountIn,
            gasLimit: 2_000_000,
        }
    );

    const receipt = await tx.wait();
    console.log("✅ Swap transaction confirmed:", receipt.hash);

    // -----------------------------
    // 5️⃣ Listen for the event
    // -----------------------------
    const events = receipt.logs
        .map((log: any) => {
            try {
                return contract.interface.parseLog(log);
            } catch {
                return null;
            }
        })
        .filter(Boolean);

    for (const e of events) {
        if (e!.name === "SwapExecuted") {
            console.log("🟢 SwapExecuted event:", e!.args);
        }
    }
}


// Run the function
// testMultiRouteSwap().catch(console.error);
