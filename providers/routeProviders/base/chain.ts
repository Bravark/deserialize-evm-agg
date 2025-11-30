import { ChainConfig } from "../UniswapV3Calculator";
//add base chain export
export const chain: ChainConfig = {
    name: "Base",
    network: "BASE",
    rpcUrl: "https://base-mainnet.g.alchemy.com/v2/nhjW11pbrLjj0j3VaFMvz",
    wrappedNativeTokenAddress: "0x4200000000000000000000000000000000000006",
    wrappedTokenSymbol: "WETH",
    nativeTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    nativeTokenSymbol: "ETH",
    stableTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    chainId: 8453
}