//controller logics here

import { NextFunction, Request, Response } from "express";
import { SwapQuoteRequestSchema, SwapRequestSchema } from "./swap.schema";
import { swapQuoteService, swapService } from "./swap.service";
import { JsonRpcProvider } from "ethers";



export const swapQuoteController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("Swap endpoint accessed");
    try {
        const data = req.body;
        console.log("data: ", data);
        //parse the data
        const chain = {
            name: "0g",
            rpc: "https://evmrpc.0g.ai"
        }

        const provider = new JsonRpcProvider(chain.rpc)
        const { body } = SwapQuoteRequestSchema.parse(req);
        const swap = await swapQuoteService(body, provider);
        console.log("Swap quote processed successfully", {
            amountOut: swap.amountOut.toString(),
        });

        res.send(swap);
    } catch (error) {
        console.log("Error in swapController", { error });
        next(error);
    }
};

export const swapTransactionController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("Swap transaction accessed");
    try {
        const data = req.body;
        console.log("data: ", data);
        //parse the data
        const chain = {
            name: "0g",
            rpc: "https://evmrpc.0g.ai"
        }

        const provider = new JsonRpcProvider(chain.rpc)
        const { body } = SwapRequestSchema.parse(req);
        const { transaction } = await swapService(body, provider);
        console.log("Swap quote processed successfully", {
            amountOut: transaction.transactions,
        });

        res.send(transaction);
    } catch (error) {
        console.log("Error in swapController", { error });
        next(error);
    }
};

export const testnetSwapQuoteController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("Swap endpoint accessed");
    try {
        const data = req.body;
        console.log("data: ", data);
        //parse the data
        const chain = {
            name: "0g",
            rpc: "https://evmrpc-testnet.0g.ai"
        }

        const provider = new JsonRpcProvider(chain.rpc)
        const { body } = SwapQuoteRequestSchema.parse(req);
        const swap = await swapQuoteService(body, provider);
        console.log("Swap quote processed successfully", {
            amountOut: swap.amountOut.toString(),
        });

        res.send(swap);
    } catch (error) {
        console.log("Error in swapController", { error });
        next(error);
    }
};

export const testnetSwapTransactionController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("Swap transaction accessed");
    try {
        const data = req.body;
        console.log("data: ", data);
        //parse the data
        const chain = {
            name: "0g",
            rpc: "https://evmrpc-testnet.0g.ai"
        }

        const provider = new JsonRpcProvider(chain.rpc)
        const { body } = SwapRequestSchema.parse(req);
        const { transaction } = await swapService(body, provider);
        console.log("Swap quote processed successfully", {
            amountOut: transaction.transactions,
        });

        res.send(transaction);
    } catch (error) {
        console.log("Error in swapController", { error });
        next(error);
    }
};


