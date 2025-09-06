import { IQuoteDataWithoutAmountIn } from "./helpers/contructHop";
import { JsonRpcProvider } from "ethers";
export declare const createSwapTX: ({ path, amountInRaw, minAmountOut }: IQuoteDataWithoutAmountIn, walletAddress: string, provider: JsonRpcProvider) => Promise<({
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
