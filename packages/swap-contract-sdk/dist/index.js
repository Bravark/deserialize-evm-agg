"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSwapTX = void 0;
const web3_1 = __importDefault(require("web3"));
const contructHop_1 = require("./helpers/contructHop");
const IMultiRouterSwapV1_json_1 = __importDefault(require("./interfaces/js/IMultiRouterSwapV1.json"));
const erc20_json_1 = __importDefault(require("./interfaces/js/erc20.json"));
const networkSetup_1 = require("./interfaces/js/networkSetup");
const bn_js_1 = __importDefault(require("bn.js"));
const createSwapTX = async ({ path, amountInRaw, minAmountOut }, walletAddress, provider, network, partnerFees) => {
    if (!walletAddress)
        throw new Error("Wallet address must be passed");
    if (path.length < 1)
        throw new Error("Invalid path");
    const { rpc, addresses: { adapterTracker, nativeToken, swapProxy } } = (0, networkSetup_1.networkSetup)(network);
    if (!nativeToken || !swapProxy || !adapterTracker)
        throw new Error("Invalid network config");
    const hops = await (0, contructHop_1.constructHop)(path, adapterTracker, provider);
    const web3 = new web3_1.default(provider._getConnection().url || rpc);
    const txs = [];
    if (path[0].tokenIn.toLowerCase() !== nativeToken.toLowerCase()) {
        const erc20 = new web3.eth.Contract(erc20_json_1.default, path[0].tokenIn);
        const allowance = await erc20.methods.allowance(walletAddress, swapProxy).call();
        if (allowance < BigInt(amountInRaw)) {
            const approveABI = erc20.methods.approve(swapProxy, amountInRaw).encodeABI();
            txs.push({
                from: walletAddress,
                to: path[0].tokenIn,
                data: approveABI,
            });
        }
    }
    const proxyContract = new web3.eth.Contract(IMultiRouterSwapV1_json_1.default, swapProxy);
    console.log('partnerFees: ', partnerFees);
    const partnerFeeSettings = partnerFees ? {
        partnerFee: partnerFees.fee * 10000,
        feeRecepient: partnerFees.recipient,
    } : {
        partnerFee: new bn_js_1.default(0),
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
exports.createSwapTX = createSwapTX;
//# sourceMappingURL=index.js.map