import { AnkrProvider, ethers, JsonRpcProvider } from "ethers";
import adapterTrackerABI from "../interfaces/js/adapterTracker.json";
import { factoryToAdapter } from "../constants/addresses";
export interface IQuoteData {
  path: IPath[];
  amountInRaw: string;
  minAmountOut: string;
  amountIn: string;
};

export interface IPath {
  factory: string;
  poolAddress: string;
  tokenIn: string;
  tokenOut: string;
  fee: any;
}

export type IQuoteDataWithoutAmountIn = Omit<IQuoteData, "amountIn">;


const rpc = "https://evmrpc-testnet.0g.ai";
const _provider = new ethers.JsonRpcProvider(rpc);
const fetchAdapter = async (factory: string, provider = _provider) => {
  const adapterTrackerContract = new ethers.Contract(
    factoryToAdapter,
    adapterTrackerABI,
    provider
  );
  return (await adapterTrackerContract.returnAdapter(factory)) as string;
};

export const constructHop = async (
  paths: IPath[],
  provider: ethers.JsonRpcProvider = _provider
) => {
  const usedFactories = new Map();
  const hops = [] as string[][];
  for (let i = 0; i < paths.length; i++) {
    if (!usedFactories.has(paths[i].factory)) {
      const adapter = await fetchAdapter(paths[i].factory, provider);
      usedFactories.set(paths[i].factory, adapter);
    }

    hops.push([
      ethers.getAddress(paths[i].tokenIn),
      ethers.getAddress(paths[i].tokenOut),
      ethers.getAddress(usedFactories.get(paths[i].factory)),
      ethers.getAddress(paths[i].poolAddress),
      "0"
    ]);
  }
  return hops;
};