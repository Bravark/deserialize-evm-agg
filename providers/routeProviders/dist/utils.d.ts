import { DeserializeRoutePlan } from "./IRoute";
interface IPath {
    factory: string;
    poolAddress: string;
    tokenIn: string;
    tokenOut: string;
    fee: any;
}
export declare const transformRoutePlanToIPath: <DexIdTypes>(factoryAddress: string, routePlan: DeserializeRoutePlan<DexIdTypes>[], nativeTokenAddress: string, warpedTokenAddress: string, isNativeIn: boolean) => IPath[];
export {};
