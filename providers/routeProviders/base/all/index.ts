
import { createAllRoute } from "../../AllContructor";
import { ZeroGRoute, ZiaRoute } from "../../0g";
import { chain } from "../chain";
import { PancakeV3Route } from "../pancake";
import { UniswapV3BaseRoute } from "../uniswap";
import { AerodromeV3Route } from "../aerodrome";


// Export the configured AllRoute class for 0G Mainnet
export const AllRouteBase = createAllRoute(
    "ALL_BASE",
    chain,
    [PancakeV3Route, UniswapV3BaseRoute, AerodromeV3Route]
);

export const DEX_IDS_BASE = {
    PANCAKE_V3: "PANCAKE_V3_BASE",
    UNISWAP_V3: "UNISWAP_V3_BASE",
    AERODROME_V3: "AERODROME_V3_BASE",
    ALL: "ALL_BASE",
} as const

export const dexIdListBase = Object.keys(DEX_IDS_BASE);
export type DexIdTypesBase = (typeof DEX_IDS_BASE)[keyof typeof DEX_IDS_BASE];
