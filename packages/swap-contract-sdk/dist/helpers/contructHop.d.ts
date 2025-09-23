import { ethers } from "ethers";
export interface IQuoteData {
    path: IPath[];
    amountInRaw: string;
    minAmountOut: string;
    amountIn: string;
}
export interface IPath {
    factory: string;
    poolAddress: string;
    tokenIn: string;
    tokenOut: string;
    fee: any;
}
export type IQuoteDataWithoutAmountIn = Omit<IQuoteData, "amountIn">;
export declare const constructHop: (paths: IPath[], adapterTracker: string, provider: ethers.JsonRpcProvider) => Promise<string[][]>;
