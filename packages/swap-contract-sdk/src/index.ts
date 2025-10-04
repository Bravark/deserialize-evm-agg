import Web3 from "web3";
import { constructHop, IQuoteDataWithoutAmountIn } from "./helpers/contructHop";
import swapABI from "./interfaces/js/IMultiRouterSwapV1.json";
import { JsonRpcProvider } from "ethers";
import erc20ABI from "./interfaces/js/erc20.json"
import { networkSetup, NetworkType } from "./interfaces/js/networkSetup";
import BN from "bn.js";

export const createSwapTX = async (
  { path, amountInRaw, minAmountOut }: IQuoteDataWithoutAmountIn,
  walletAddress: string,
  provider: JsonRpcProvider,
  network: NetworkType,
  // isNativeIn: boolean,
  partnerFees?: { recipient: string; fee: number }
) => {

  if (!walletAddress) throw new Error("Wallet address must be passed");
  if (path.length < 1) throw new Error("Invalid path");
  const { rpc, addresses: { adapterTracker, nativeToken, swapProxy } } = networkSetup(network)
  if (!nativeToken || !swapProxy || !adapterTracker) throw new Error("Invalid network config")
  const hops = await constructHop(path, adapterTracker, provider);
  const web3 = new Web3(provider._getConnection().url || rpc);
  const txs = []

  // if (!isNativeIn) {
  if (path[0].tokenIn.toLowerCase() !== nativeToken.toLowerCase()) {
    const erc20 = new web3.eth.Contract(erc20ABI, path[0].tokenIn)
    const allowance = await erc20.methods.allowance(walletAddress, swapProxy).call() as bigint

    if (allowance < BigInt(amountInRaw)) {
      const approveABI = erc20.methods.approve(swapProxy, amountInRaw).encodeABI()
      txs.push({
        from: walletAddress,
        to: path[0].tokenIn,
        data: approveABI,
      });
    }

  }
  // }


  const proxyContract = new web3.eth.Contract(swapABI, swapProxy);

  console.log('partnerFees: ', partnerFees);
  const partnerFeeSettings = partnerFees ? {
    partnerFee: partnerFees.fee * 100,
    feeRecepient: partnerFees.recipient,
  } : {
    partnerFee: 0,
    feeRecepient: "0x0000000000000000000000000000000000000000",
  };

  console.log('partnerFeeSettings: ', partnerFeeSettings);
  console.log('hops: ', hops);
  const proxyABI = proxyContract.methods
    .swap(hops, amountInRaw, minAmountOut, partnerFeeSettings)
    .encodeABI();

  txs.push({
    from: walletAddress,
    to: swapProxy,
    data: proxyABI,
    value: path[0].tokenIn == nativeToken ? amountInRaw : "0",
  });
  return txs;
};
