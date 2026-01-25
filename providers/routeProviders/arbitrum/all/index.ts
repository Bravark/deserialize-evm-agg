
import { createAllRoute } from "../../AllContructor";
import { chain } from "../chain";
import { PancakeV3ArbitrumRoute } from "../pancake";
import { UniswapV3ArbitrumRoute } from "../uniswap";



// Export the configured AllRoute class for 0G Mainnet
export const AllRouteArbitrum = createAllRoute(
    "ALL_ARBITRUM",
    chain,
    [PancakeV3ArbitrumRoute, UniswapV3ArbitrumRoute]
);

export const DEX_IDS_ARBITRUM = {
    PANCAKE_V3: "PANCAKE_V3_ARBITRUM",
    UNISWAP_V3: "UNISWAP_V3_ARBITRUM",
    AERODROME_V3: "AERODROME_V3_ARBITRUM",
    ALL: "ALL_ARBITRUM",
} as const

export const dexIdListArbitrum = Object.keys(DEX_IDS_ARBITRUM);
export type DexIdTypesArbitrum = (typeof DEX_IDS_ARBITRUM)[keyof typeof DEX_IDS_ARBITRUM];
