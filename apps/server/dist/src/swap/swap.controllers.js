"use strict";
//controller logics here
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenListWithDetailsController = exports.tokenDetailsController = exports.tokenPriceController = exports.tokenListController = exports.testnetSwapTransactionController = exports.testnetSwapQuoteController = exports.swapTransactionController = exports.swapQuoteController = void 0;
const swap_schema_1 = require("./swap.schema");
const swap_service_1 = require("./swap.service");
const ethers_1 = require("ethers");
const swapQuoteController = async (req, res, next) => {
    console.log("Swap endpoint accessed");
    try {
        const data = req.body;
        //parse the data
        const chain = {
            name: "0g",
            rpc: "https://evmrpc.0g.ai"
        };
        const provider = new ethers_1.JsonRpcProvider(chain.rpc);
        const { body } = swap_schema_1.SwapQuoteRequestSchema.parse(req);
        const swap = await (0, swap_service_1.swapQuoteService)(body, provider);
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
        //parse the data
        const chain = {
            name: "0g",
            rpc: "https://evmrpc.0g.ai"
        };
        const provider = new ethers_1.JsonRpcProvider(chain.rpc);
        const { body } = swap_schema_1.SwapRequestSchema.parse(req);
        const { transaction } = await (0, swap_service_1.swapService)(body, provider);
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
const testnetSwapQuoteController = async (req, res, next) => {
    console.log("Swap endpoint accessed");
    try {
        const data = req.body;
        //parse the data
        const chain = {
            name: "0g",
            rpc: "https://evmrpc-testnet.0g.ai"
        };
        const provider = new ethers_1.JsonRpcProvider(chain.rpc);
        const { body } = swap_schema_1.SwapQuoteRequestSchema.parse(req);
        const swap = await (0, swap_service_1.swapQuoteService)(body, provider);
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
exports.testnetSwapQuoteController = testnetSwapQuoteController;
const testnetSwapTransactionController = async (req, res, next) => {
    console.log("Swap transaction accessed");
    try {
        const data = req.body;
        //parse the data
        const chain = {
            name: "0g",
            rpc: "https://evmrpc-testnet.0g.ai"
        };
        const provider = new ethers_1.JsonRpcProvider(chain.rpc);
        const { body } = swap_schema_1.SwapRequestSchema.parse(req);
        const { transaction } = await (0, swap_service_1.swapService)(body, provider);
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
    console.log("Token List accessed");
    try {
        //parse the data
        const chain = {
            name: "0g",
            rpc: "https://evmrpc.0g.ai"
        };
        const provider = new ethers_1.JsonRpcProvider(chain.rpc);
        const result = await (0, swap_service_1.tokenList)(provider);
        res.send({ result });
    }
    catch (error) {
        console.log("Error in tokeList", { error });
        next(error);
    }
};
exports.tokenListController = tokenListController;
const tokenPriceController = async (req, res, next) => {
    console.log("Token List accessed");
    try {
        //parse the data
        const chain = {
            name: "0g",
            rpc: "https://evmrpc.0g.ai"
        };
        const provider = new ethers_1.JsonRpcProvider(chain.rpc);
        const { params } = swap_schema_1.TokenPriceRequestSchema.parse(req);
        const result = await (0, swap_service_1.getTokenPriceService)(params.tokenAddress, provider);
        res.send({ result });
    }
    catch (error) {
        console.log("Error in tokeList", { error });
        next(error);
    }
};
exports.tokenPriceController = tokenPriceController;
const tokenDetailsController = async (req, res, next) => {
    console.log("Token List accessed");
    try {
        //parse the data
        const chain = {
            name: "0g",
            rpc: "https://evmrpc.0g.ai"
        };
        const provider = new ethers_1.JsonRpcProvider(chain.rpc);
        const { params } = swap_schema_1.TokenDetailsRequestSchema.parse(req);
        const result = await (0, swap_service_1.getTokenDetailsService)(params.tokenAddress, provider);
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
        const chain = {
            name: "0g",
            rpc: "https://evmrpc.0g.ai"
        };
        const provider = new ethers_1.JsonRpcProvider(chain.rpc);
        const result = await (0, swap_service_1.tokenListWithDetailsService)(provider);
        res.send({ result });
    }
    catch (error) {
        console.log("Error in tokenListWithDetails", { error });
        next(error);
    }
};
exports.tokenListWithDetailsController = tokenListWithDetailsController;
