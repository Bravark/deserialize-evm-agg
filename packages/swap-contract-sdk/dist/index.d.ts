import { IQuoteDataWithoutAmountIn } from "./helpers/contructHop";
import { JsonRpcProvider } from "ethers";
import { NetworkType } from "./interfaces/js/networkSetup";
export declare const createSwapTX: ({ path, amountInRaw, minAmountOut }: IQuoteDataWithoutAmountIn, walletAddress: string, provider: JsonRpcProvider, network: NetworkType) => Promise<({
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
