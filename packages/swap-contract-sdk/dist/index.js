"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSwapTX = void 0;
const web3_1 = __importDefault(require("web3"));
const contructHop_1 = require("./helpers/contructHop");
const network_1 = require("./constants/network");
const IMultiRouterSwapV1_json_1 = __importDefault(require("./interfaces/js/IMultiRouterSwapV1.json"));
const addresses_1 = require("./constants/addresses");
const createSwapTX = async ({ path, amountInRaw, minAmountOut }, walletAddress, provider) => {
    if (!walletAddress)
        throw new Error("Wallet address must be passed");
    if (path.length < 1)
        throw new Error("Invalid path");
    const hops = await (0, contructHop_1.constructHop)(path, provider);
    const web3 = new web3_1.default(network_1.rpc);
    const proxyContract = new web3.eth.Contract(IMultiRouterSwapV1_json_1.default, addresses_1.proxy);
    const proxyABI = proxyContract.methods
        .swap(hops, amountInRaw, minAmountOut)
        .encodeABI();
    const tx = {
        from: walletAddress,
        to: addresses_1.proxy,
        data: proxyABI,
        value: path[0].tokenIn == addresses_1.defaultA0GITokenAddress ? amountInRaw : "0",
    };
    return tx;
};
exports.createSwapTX = createSwapTX;
//# sourceMappingURL=index.js.map