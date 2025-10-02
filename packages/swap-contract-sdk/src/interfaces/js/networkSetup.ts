export type NetworkType = "0gMainnet" | "0gTestnet"
const rpcMainnet = "https://evmrpc.0g.ai/"
const rpcTestnet = "https://evmrpc-testnet.0g.ai"
export const networkSetup = (network: NetworkType) => {
    const config = { rpc: "", addresses: { adapterTracker: "", swapProxy: "", nativeToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" } }
    if (network == "0gMainnet") {
        config.rpc = rpcMainnet;
        config.addresses.adapterTracker = "0xc4b688854e870408E82519204918c8130Fbe4764";
        config.addresses.swapProxy = "0x228864aeAAE12Ee8000D9543d9cCfB538F46Da3b";
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