
import { createAllRoute } from "../../AllContructor";
import { ZeroGRoute, ZiaRoute } from "../../0g";
import { JsonRpcProvider } from "ethers";
import { DexCache } from "@deserialize-evm-agg/cache";


// Export the configured AllRoute class for 0G Mainnet
export const AllRoute = createAllRoute(
    "0gMainnet",
    [ZeroGRoute, ZiaRoute]
);

export const DEX_IDS = {
    ZERO_G: "ZERO_G",
    ZIA: "ZIA",
    ALL: "ALL",
}

export const dexIdList = Object.keys(DEX_IDS);
export type DexIdTypes = (typeof DEX_IDS)[keyof typeof DEX_IDS];
