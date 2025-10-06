import { Token } from "./type";
import { DeserializeRoutePlan } from "./IRoute";
import { Contract, JsonRpcProvider } from "ethers";
import { ERC20_ABI } from "./UniswapV3Calculator";

interface IQuoteData {
    path: IPath[];
    amountInRaw: string;
    minAmountOut: string;
    amountIn: string;
}
interface IPath {
    factory: string;
    poolAddress: string;
    tokenIn: string;
    tokenOut: string;
    fee: any;
}
type IQuoteDataWithoutAmountIn = Omit<IQuoteData, "amountIn">;
export const transformRoutePlanToIPath = <DexIdTypes>(factoryAddress: string, routePlan: DeserializeRoutePlan<DexIdTypes>[], nativeTokenAddress: string, warpedTokenAddress: string, isNativeIn: boolean, isNativeOut: boolean): IPath[] => {
    const plan: IPath[] = [];
    for (const route of routePlan) {
        const path: IPath = {
            factory: factoryAddress, // Assuming factory is always ZERO_G for this example
            poolAddress: route.poolAddress,
            // tokenIn: route.aToB ? route.tokenA : route.tokenB,
            tokenIn: isNativeIn ? route.tokenA.toLowerCase() === warpedTokenAddress.toLowerCase() ? nativeTokenAddress : route.tokenA : route.tokenA,
            // tokenOut: route.aToB ? route.tokenB : route.tokenA,
            tokenOut: isNativeOut ? route.tokenB.toLowerCase() === warpedTokenAddress.toLowerCase() ? nativeTokenAddress : route.tokenB : route.tokenB,
            fee: route.fee,
        };
        plan.push(path);
    }
    return plan;
};

export const getTokenDetails = async (tokenAddress: string, provider: JsonRpcProvider): Promise<Token> => {
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
    const [decimals, symbol, name] = await Promise.all([
        tokenContract.decimals(),
        tokenContract.symbol(),
        tokenContract.name(),
    ]);

    const tokenDetails: Token = {
        address: tokenAddress,
        decimals: Number(decimals),
        symbol: symbol,
        name: name
    };
    return tokenDetails;
}