import Web3 from "web3";
import { constructHop, IQuoteDataWithoutAmountIn } from "./helpers/contructHop";
import { rpc } from "./constants/network";
import swapABI from "./interfaces/js/IMultiRouterSwapV1.json";
import { defaultA0GITokenAddress, proxy } from "./constants/addresses";
import { JsonRpcProvider } from "ethers";
import erc20ABI from "./interfaces/js/erc20.json"

export const createSwapTX = async (
  { path, amountInRaw, minAmountOut }: IQuoteDataWithoutAmountIn,
  walletAddress: string,
  provider: JsonRpcProvider
) => {
  if (!walletAddress) throw new Error("Wallet address must be passed");
  if (path.length < 1) throw new Error("Invalid path");
  const hops = await constructHop(path, provider);
  const web3 = new Web3(rpc);
  const txs = []

  if (path[0].tokenIn != defaultA0GITokenAddress) {
    const erc20 = new web3.eth.Contract(erc20ABI, path[0].tokenIn)
    const allowance = await erc20.methods.allowance(walletAddress, proxy).call() as bigint

    if (allowance < BigInt(amountInRaw)) {
      const approveABI = erc20.methods.approve(proxy, amountInRaw).encodeABI()
      txs.push({
        from: walletAddress,
        to: path[0].tokenIn,
        data: approveABI,
      });
    }

  }
  const proxyContract = new web3.eth.Contract(swapABI, proxy);

  const proxyABI = proxyContract.methods
    .swap(hops, amountInRaw, minAmountOut)
    .encodeABI();

  txs.push({
    from: walletAddress,
    to: proxy,
    data: proxyABI,
    value: path[0].tokenIn == defaultA0GITokenAddress ? amountInRaw : "0",
  });
  return txs;
};
