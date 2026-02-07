"use strict";
//controller logics here
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenListWithDetailsController = exports.tokenDetailsController = exports.tokenPriceController = exports.tokenListController = exports.testnetSwapTransactionController = exports.swapTransactionController = exports.swapQuoteController = void 0;
const swap_schema_1 = require("./swap.schema");
const swap_service_1 = require("./swap.service");
const ethers_1 = require("ethers");
const routes_providers_1 = require("@deserialize-evm-agg/routes-providers");
const swapQuoteController = async (req, res, next) => {
    console.log("Swap endpoint accessed");
    try {
        const data = req.body;
        //parse the data
        const { body, params } = swap_schema_1.SwapQuoteRequestSchema.parse(req);
        let chain;
        if (!params?.chain) {
            chain = (0, routes_providers_1.getChainFromName)("0G");
        }
        else {
            chain = (0, routes_providers_1.getChainFromName)(params.chain);
        }
        const provider = new ethers_1.JsonRpcProvider(chain.rpcUrl);
        const swap = await (0, swap_service_1.swapQuoteService)(body, provider, params?.chain ?? "0G");
        console.log("Swap quote processed successfully", {
            amountOut: swap.amountOut.toString(),
        });
        res.send(swap);
    }
    catch (error) {
        console.log("Error in swapController", { error });
        next(error);
    }
};
exports.swapQuoteController = swapQuoteController;
const swapTransactionController = async (req, res, next) => {
    console.log("Swap transaction accessed");
    try {
        const data = req.body;
        const { body, params } = swap_schema_1.SwapRequestSchema.parse(req);
        //parse the data
        let chain;
        if (!params?.chain) {
            chain = (0, routes_providers_1.getChainFromName)("0G");
        }
        else {
            chain = (0, routes_providers_1.getChainFromName)(params.chain);
        }
        const provider = new ethers_1.JsonRpcProvider(chain.rpcUrl);
        const { transaction } = await (0, swap_service_1.swapService)(body, provider, params?.chain ?? "0G");
        console.log("Swap quote processed successfully", {
            amountOut: transaction.transactions,
        });
        res.send(transaction);
    }
    catch (error) {
        console.log("Error in swapController", { error });
        next(error);
    }
};
exports.swapTransactionController = swapTransactionController;
// export const testnetSwapQuoteController = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) => {
//     console.log("Swap endpoint accessed");
//     try {
//         const data = req.body;
//         //parse the data
//         const chain = {
//             name: "0g",
//             rpc: "https://evmrpc-testnet.0g.ai"
//         }
//         const provider = new JsonRpcProvider(chain.rpc)
//         const { body } = SwapQuoteRequestSchema.parse(req);
//         const swap = await swapQuoteService(body, provider);
//         console.log("Swap quote processed successfully", {
//             amountOut: swap.amountOut.toString(),
//         });
//         res.send(swap);
//     } catch (error) {
//         console.log("Error in swapController", { error });
//         next(error);
//     }
// };
const testnetSwapTransactionController = async (req, res, next) => {
    console.log("Swap transaction accessed");
    try {
        const data = req.body;
        //parse the data
        const { body, params } = swap_schema_1.SwapRequestSchema.parse(req);
        let chain;
        if (!params?.chain) {
            chain = (0, routes_providers_1.getChainFromName)("0G");
        }
        else {
            chain = (0, routes_providers_1.getChainFromName)(params.chain);
        }
        const provider = new ethers_1.JsonRpcProvider(chain.rpcUrl);
        const { transaction } = await (0, swap_service_1.swapService)(body, provider, params?.chain ?? "0G");
        console.log("Swap quote processed successfully", {
            amountOut: transaction.transactions,
        });
        res.send(transaction);
    }
    catch (error) {
        console.log("Error in swapController", { error });
        next(error);
    }
};
exports.testnetSwapTransactionController = testnetSwapTransactionController;
const tokenListController = async (req, res, next) => {
    // console.log("Token List accessed");
    try {
        //parse the data
        const { params } = req;
        const chain = (0, routes_providers_1.getChainFromName)(params.chain ?? "0G");
        const provider = new ethers_1.JsonRpcProvider(chain.rpcUrl);
        const result = await (0, swap_service_1.tokenList)(provider, params.chain ?? "0G");
        res.send({ result });
    }
    catch (error) {
        console.log("Error in tokeList", { error });
        next(error);
    }
};
exports.tokenListController = tokenListController;
const tokenPriceController = async (req, res, next) => {
    // console.log("Token List accessed");
    try {
        //parse the data
        const { params } = swap_schema_1.TokenPriceRequestSchema.parse(req);
        const chain = (0, routes_providers_1.getChainFromName)(params.chain ?? "0G");
        const provider = new ethers_1.JsonRpcProvider(chain.rpcUrl);
        const result = await (0, swap_service_1.getTokenPriceService)(params.tokenAddress, provider, params.chain ?? "0G");
        res.send({ result });
    }
    catch (error) {
        console.log("Error in tokeList", { error });
        next(error);
    }
};
exports.tokenPriceController = tokenPriceController;
const tokenDetailsController = async (req, res, next) => {
    // console.log("Token List accessed");
    try {
        //parse the data
        const { params } = swap_schema_1.TokenDetailsRequestSchema.parse(req);
        const chain = (0, routes_providers_1.getChainFromName)(params.chain ?? "0G");
        const provider = new ethers_1.JsonRpcProvider(chain.rpcUrl);
        const result = await (0, swap_service_1.getTokenDetailsService)(params.tokenAddress, provider, params.chain ?? "0G");
        res.send({ result });
    }
    catch (error) {
        console.log("Error in tokeList", { error });
        next(error);
    }
};
exports.tokenDetailsController = tokenDetailsController;
const tokenListWithDetailsController = async (req, res, next) => {
    console.log("Token List with Details accessed");
    try {
        //parse the data
        const { params } = req;
        const chain = (0, routes_providers_1.getChainFromName)(params.chain ?? "0G");
        const provider = new ethers_1.JsonRpcProvider(chain.rpcUrl);
        const result = await (0, swap_service_1.tokenListWithDetailsService)(provider, params.chain ?? "0G");
        res.send({ result });
    }
    catch (error) {
        console.log("Error in tokenListWithDetails", { error });
        next(error);
    }
};
exports.tokenListWithDetailsController = tokenListWithDetailsController;
