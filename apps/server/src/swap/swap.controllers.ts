//controller logics here

import { NextFunction, Request, Response } from "express";
import { SwapQuoteRequestSchema, SwapRequestSchema, TokenDetailsRequestSchema, TokenPriceRequestSchema } from "./swap.schema";
import { getTokenDetailsService, getTokenPriceService, swapQuoteService, swapService, tokenList, tokenListWithDetailsService } from "./swap.service";
import { JsonRpcProvider } from "ethers";
import { NetworkType } from "@deserialize-evm-agg/routes-providers/dist/constants";
import { BaseChain, getChainFromName, OgChain } from "@deserialize-evm-agg/routes-providers";
import { get } from "lodash";


export const swapQuoteController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("Swap endpoint accessed");
    try {
        const data = req.body;

        //parse the data
        const { body, params } = SwapQuoteRequestSchema.parse(req);
        let chain
        if (!params?.chain) {
            chain = getChainFromName("0G")
        } else {
            chain = getChainFromName(params.chain as NetworkType)
        }
        const provider = new JsonRpcProvider(chain.rpcUrl)
        const swap = await swapQuoteService(body, provider, params?.chain as NetworkType ?? "0G");
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

        const { body, params } = SwapRequestSchema.parse(req);
        //parse the data
        let chain
        if (!params?.chain) {
            chain = getChainFromName("0G")
        } else {
            chain = getChainFromName(params.chain as NetworkType)
        }
        const provider = new JsonRpcProvider(chain.rpcUrl)
        const { transaction } = await swapService(body, provider, params?.chain as NetworkType ?? "0G");
        console.log("Swap quote processed successfully", {
            amountOut: transaction.transactions,
        });

        res.send(transaction);
    } catch (error) {
        console.log("Error in swapController", { error });
        next(error);
    }
};

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

export const testnetSwapTransactionController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("Swap transaction accessed");
    try {
        const data = req.body;

        //parse the data
        const { body, params } = SwapRequestSchema.parse(req);
        let chain
        if (!params?.chain) {
            chain = getChainFromName("0G")
        } else {
            chain = getChainFromName(params.chain as NetworkType)
        }
        const provider = new JsonRpcProvider(chain.rpcUrl)
        const { transaction } = await swapService(body, provider, params?.chain as NetworkType ?? "0G");
        console.log("Swap quote processed successfully", {
            amountOut: transaction.transactions,
        });

        res.send(transaction);
    } catch (error) {
        console.log("Error in swapController", { error });
        next(error);
    }
};


export const tokenListController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("Token List accessed");
    try {

        //parse the data
        const { params } = req
        const chain = getChainFromName(params.chain as NetworkType ?? "0G")
        const provider = new JsonRpcProvider(chain.rpcUrl)
        const result = await tokenList(provider, params.chain as NetworkType ?? "0G");

        res.send({ result });
    } catch (error) {
        console.log("Error in tokeList", { error });
        next(error);
    }
};

export const tokenPriceController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("Token List accessed");
    try {

        //parse the data
        const { params } = TokenPriceRequestSchema.parse(req);
        const chain = getChainFromName(params.chain as NetworkType ?? "0G")
        const provider = new JsonRpcProvider(chain.rpcUrl)

        const result = await getTokenPriceService(params.tokenAddress, provider, params.chain as NetworkType ?? "0G");

        res.send({ result });
    } catch (error) {
        console.log("Error in tokeList", { error });
        next(error);
    }
};



export const tokenDetailsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("Token List accessed");
    try {

        //parse the data
        const { params } = TokenDetailsRequestSchema.parse(req);
        const chain = getChainFromName(params.chain as NetworkType ?? "0G")
        const provider = new JsonRpcProvider(chain.rpcUrl)

        const result = await getTokenDetailsService(params.tokenAddress, provider, params.chain as NetworkType ?? "0G");

        res.send({ result });
    } catch (error) {
        console.log("Error in tokeList", { error });
        next(error);
    }
};




export const tokenListWithDetailsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("Token List with Details accessed");
    try {

        //parse the data
        const { params } = req
        const chain = getChainFromName(params.chain as NetworkType ?? "0G")
        const provider = new JsonRpcProvider(chain.rpcUrl)
        const result = await tokenListWithDetailsService(provider, params.chain as NetworkType ?? "0G");

        res.send({ result });
    } catch (error) {
        console.log("Error in tokenListWithDetails", { error });
        next(error);
    }
};
