import { IQuoteDataWithoutAmountIn } from "./helpers/contructHop";
import { JsonRpcProvider } from "ethers";
export declare const createSwapTX: ({ path, amountInRaw, minAmountOut }: IQuoteDataWithoutAmountIn, walletAddress: string, provider: JsonRpcProvider, network: {
    id: string;
    rpc: string;
}, partnerFees?: {
    recipient: string;
    fee: number;
}) => Promise<({
    from: string;
    to: string;
    data: string;
    value?: undefined;
} | {
    from: string;
    to: string;
    data: string;
    value: string;
})[]>;
