
import { DexConfig, } from "../../UniswapV3Calculator";

import { v3PoolAbi } from "../../v3PoolAbi";

import { createV3Route } from "../../v3Route";


const config: DexConfig = {
    name: "Zia",
    factoryAddress: "0x6F3945Ab27296D1D66D8EEB042ff1B4fb2E0CE70",
    quoterAddress: "0x23b55293b7F06F6c332a0dDA3D88d8921218425B",
    fromBlock: "0",
    network: "0gMainnet",
    //! TODO: THIS IS NOT THE STABLE COIN ADDRESS ON MAINNET
    stableTokenAddress: "0x1f3aa82227281ca364bfb3d253b0f1af1da6473e",
    abi: v3PoolAbi,
    wrappedNativeTokenAddress: "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c",
    nativeTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
}

export const ZiaRoute = createV3Route(
    config,
    "ZIA",
);
// Export type for convenience
export type ZiaRouteType = InstanceType<typeof ZiaRoute>;