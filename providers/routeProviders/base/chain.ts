import { ChainConfig } from "../UniswapV3Calculator";
//add base chain export
export const chain: ChainConfig = {
    name: "Base",
    network: "BASE",
    rpcUrl: "https://base-mainnet.g.alchemy.com/v2/Afwsc8tOtKoTwYvd4M4UeyIOFTrKt-fy",
    wrappedNativeTokenAddress: "0x4200000000000000000000000000000000000006",
    wrappedTokenSymbol: "WETH",
    nativeTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    nativeTokenSymbol: "ETH"
}