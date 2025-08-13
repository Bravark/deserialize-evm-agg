import Web3 from "web3";
import { constructHop, IQuoteDataWithoutAmountIn } from "./helpers/contructHop";
import { rpc } from "./constants/network";
import swapABI from "./interfaces/js/IMultiRouterSwapV1.json";
import { defaultA0GITokenAddress, proxy } from "./constants/addresses";
import { JsonRpcProvider } from "ethers";


export const createSwapTX = async (
  { path, amountInRaw, minAmountOut }: IQuoteDataWithoutAmountIn,
  walletAddress: string,
  provider: JsonRpcProvider
) => {
  if (!walletAddress) throw new Error("Wallet address must be passed");
  if (path.length < 1) throw new Error("Invalid path");
  const hops = await constructHop(path, provider);
  const web3 = new Web3(rpc);
  const proxyContract = new web3.eth.Contract(swapABI, proxy);

  const proxyABI = proxyContract.methods
    .swap(hops, amountInRaw, minAmountOut)
    .encodeABI();

  const tx = {
    from: walletAddress,
    to: proxy,
    data: proxyABI,
    value: path[0].tokenIn == defaultA0GITokenAddress ? amountInRaw : "0",
  };
  return tx;
};
