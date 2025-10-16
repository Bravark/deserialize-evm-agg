

export const networkSetup = (network: { id: string, rpc: string }) => {
    const config = { rpc: "", addresses: { adapterTracker: "", swapProxy: "", nativeToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" } }
    if (network.id == "0G") {
        config.rpc = network.rpc;
        config.addresses.adapterTracker = "0xc4b688854e870408E82519204918c8130Fbe4764";
        config.addresses.swapProxy = "0x228864aeAAE12Ee8000D9543d9cCfB538F46Da3b";
        return config
    }
    if (network.id == "BASE") {
        config.rpc = network.rpc;
        config.addresses.adapterTracker = "0xf0c3D4dE61d78742Eb51dffA29A109aCE473892F";
        config.addresses.swapProxy = "0xADb0018bCF10b7dD84B7C3e2D92889185DA41f45";
        return config
    }
    return config
}