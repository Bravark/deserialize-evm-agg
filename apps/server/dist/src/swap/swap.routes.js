"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// swap.routes.ts
const express_1 = require("express");
const swap_controllers_1 = require("./swap.controllers");
const swapRouter = (0, express_1.Router)();
// swapRouter.get("/ping", pingController);
// swapRouter.get("/quest/*", questController);
// swapRouter.get("/tokenPrice/:tokenAddress", tokenPriceController);
// swapRouter.post("/getMintBalances", getTokenBalanceController);
// swapRouter.get("/tokenList", tokenListController);
swapRouter.post("/quote", swap_controllers_1.swapQuoteController);
// swapRouter.post("/quoteAll", swapQuoteAllController);
// swapRouter.post("/quoteAllBetter", swapQuoteAllBetterController);
// swapRouter.post("/swap", swapController);
// swapRouter.post("/setQuest", setBoostController);
// swapRouter.get("/allPoints", allUserPointsController);
// swapRouter.get("/unWrapEth/:tokenAddress", unWrapEthTxController);
// swapRouter.post("/getGaslessTransaction", getGaslessTransactionController);
// swapRouter.post(
//     "/submitGaslessTransaction",
//     submitGaslessTransactionRequestController
// );
// swapRouter.post("/createAta", getTokenAtaTransactionController)
exports.default = swapRouter;
