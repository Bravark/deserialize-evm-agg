import { Token } from "./type";
import { DeserializeRoutePlan } from "./IRoute";
import { JsonRpcProvider } from "ethers";
interface IPath {
    factory: string;
    poolAddress: string;
    tokenIn: string;
    tokenOut: string;
    fee: any;
}
export declare const transformRoutePlanToIPath: <DexIdTypes>(factoryAddress: string, routePlan: DeserializeRoutePlan<DexIdTypes>[], nativeTokenAddress: string, warpedTokenAddress: string, isNativeIn: boolean, isNativeOut: boolean) => IPath[];
export declare const getTokenDetails: (tokenAddress: string, provider: JsonRpcProvider) => Promise<Token>;
export {};
