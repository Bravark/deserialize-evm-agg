// swap.routes.ts
import { Router } from "express";
import {
    // allUserPointsController,
    // getGaslessTransactionController,
    // getTokenAtaTransactionController,
    // getTokenBalanceController,
    // pingController,
    // questController,
    // setBoostController,
    // submitGaslessTransactionRequestController,
    // swapController,
    // swapQuoteAllBetterController,
    // swapQuoteAllController,
    swapQuoteController,
    // tokenListController,
    // tokenPriceController,
    // unWrapEthTxController,
} from "./swap.controllers";

const swapRouter: Router = Router();

// swapRouter.get("/ping", pingController);

// swapRouter.get("/quest/*", questController);

// swapRouter.get("/tokenPrice/:tokenAddress", tokenPriceController);

// swapRouter.post("/getMintBalances", getTokenBalanceController);

// swapRouter.get("/tokenList", tokenListController);

swapRouter.post("/quote", swapQuoteController);
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
export default swapRouter;
