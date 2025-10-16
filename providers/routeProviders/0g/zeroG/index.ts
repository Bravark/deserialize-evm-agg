
import { chain } from "../chain";
import { DexConfig, } from "../../UniswapV3Calculator";

import { v3PoolAbi } from "../../v3FactoryAbi";

import { createV3Route } from "../../v3Route";


const config: DexConfig = {
    name: "Janie (formally Zero G)",
    factoryAddress: "0x9bdcA5798E52e592A08e3b34d3F18EeF76Af7ef4",
    quoterAddress: "0xd00883722cECAD3A1c60bCA611f09e1851a0bE02",
    fromBlock: "0",
    network: "0G",
    //! TODO: THIS IS NOT THE STABLE COIN ADDRESS ON MAINNET
    stableTokenAddress: "0x1f3aa82227281ca364bfb3d253b0f1af1da6473e",
    abi: v3PoolAbi,
    wrappedNativeTokenAddress: "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c",
    nativeTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
}

export const ZeroGRoute = createV3Route(
    config,
    chain,
    "ZERO_G",
);
// Export type for convenience
export type ZeroGRouteType = InstanceType<typeof ZeroGRoute>;