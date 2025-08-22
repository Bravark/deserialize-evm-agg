export const getSwapRequestFeeRate = (tokenA: string, tokenB: string) => {
    return DYNAMIC_FEE_LIST.find(
        (fee) =>
            fee.tokens.find((t) => t === tokenA) &&
            fee.tokens.find((t) => t === tokenB)
    );
};

export const DYNAMIC_FEE_LIST = [
    {
        tokens: [
            "So11111111111111111111111111111111111111112",
            "GU7NS9xCwgNPiAdJ69iusFrRfawjDDPjeMBovhV1d4kn",
        ],
        feeRate: 0.09,
    },
];