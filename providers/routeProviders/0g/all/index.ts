
import { createAllRoute } from "../../AllContructor";
import { ZeroGRoute, ZiaRoute } from "../../0g";
import { chain } from "../chain";


// Export the configured AllRoute class for 0G Mainnet
export const AllRoute0G = createAllRoute(
    "ALL_0G",
    chain,
    [ZeroGRoute, ZiaRoute]
);

export const DEX_IDS_0G = {
    ZERO_G: "ZERO_G",
    ZIA: "ZIA",
    ALL: "ALL_0G",
} as const

export const dexIdList0G = Object.keys(DEX_IDS_0G);
export type DexIdTypes0G = (typeof DEX_IDS_0G)[keyof typeof DEX_IDS_0G];
