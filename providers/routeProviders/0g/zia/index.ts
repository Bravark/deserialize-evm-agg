
import { chain } from "../chain";
import { DexConfig, } from "../../UniswapV3Calculator";

import { v3PoolAbi } from "../../v3FactoryAbi";

import { createV3Route } from "../../v3Route";
import { UniswapV3QuoteCalculatorV2 } from "../../UniswapV3CalculatorV2";


export const ZIA_CONFIG: DexConfig = {
    name: "Zia",
    factoryAddress: "0x6F3945Ab27296D1D66D8EEB042ff1B4fb2E0CE70",
    quoterAddress: "0x23b55293b7F06F6c332a0dDA3D88d8921218425B",
    fromBlock: "0",
    network: "0G",
    //! TODO: THIS IS NOT THE STABLE COIN ADDRESS ON MAINNET
    stableTokenAddress: "0x1f3aa82227281ca364bfb3d253b0f1af1da6473e",
    abi: v3PoolAbi,
    wrappedNativeTokenAddress: "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c",
    nativeTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
}
const calculator = new UniswapV3QuoteCalculatorV2(ZIA_CONFIG, chain)
export const ZiaRoute = createV3Route(
    ZIA_CONFIG,
    chain,
    "ZIA",
    calculator
);
// Export type for convenience
export type ZiaRouteType = InstanceType<typeof ZiaRoute>;