import { DexCache } from "@deserialize-evm-agg/cache";
import { JsonRpcProvider } from "ethers";
import { IRoute } from "./IRoute";

// types.ts


export interface AllPoolMapType<DexIdTypes> extends Map<DexIdTypes, any> { }
export type CacheAllPoolMapType<DexIdTypes> = [DexIdTypes, any][];

export interface Token {
    address: string;
    decimals: number;
    symbol: string;
    name: string
}