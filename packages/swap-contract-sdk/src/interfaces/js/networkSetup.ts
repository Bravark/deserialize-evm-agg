export type NetworkType = "0gMainnet" | "0gTestnet"
const rpcMainnet = "https://evmrpc.0g.ai/"
const rpcTestnet = "https://evmrpc-testnet.0g.ai"
export const networkSetup = (network: NetworkType) => {
    const config = { rpc: "", addresses: { adapterTracker: "", swapProxy: "", nativeToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" } }
    if (network == "0gMainnet") {
        config.rpc = rpcMainnet;
        config.addresses.adapterTracker = "0x88A5E26Dd738AC81ab73FFfcFB91c20d4E8Df528";
        config.addresses.swapProxy = "0x40213Df989de86a8523Fb175235813ADfE4CeF6f";
        return config
    }
    if (network == "0gTestnet") {
        config.rpc = rpcTestnet;
        config.addresses.adapterTracker = "0x1B808cA2E7A4a38C496d3158D440EC543F1Ef3Ab";
        config.addresses.swapProxy = "0x3bA8e45a7f87931055d4eA6971E356cf3c6b2480";
        return config
    }
    return config
}