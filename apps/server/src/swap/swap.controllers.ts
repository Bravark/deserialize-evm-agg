//controller logics here

import { NextFunction, Request, Response } from "express";
import { SwapQuoteRequestSchema, SwapRequestSchema, TokenDetailsRequestSchema, TokenPriceRequestSchema } from "./swap.schema";
import { getTokenDetailsService, getTokenPriceService, swapQuoteService, swapService, tokenList, tokenListWithDetailsService } from "./swap.service";
import { createJsonRpcProvider, getChainFromName, normalizeNetworkType, NetworkType } from "@deserialize-evm-agg/routes-providers";

const chainFromRequest = (paramChain?: string, bodyChain?: string): NetworkType => {
    return normalizeNetworkType(paramChain || bodyChain || "0G");
};

const providerForChain = (chainName: NetworkType) => {
    const chain = getChainFromName(chainName);
    return createJsonRpcProvider(chain.rpcUrl, chain.chainId);
};


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
        const chainName = chainFromRequest(params?.chain, body.chain);
        const provider = providerForChain(chainName);
        const swap = await swapQuoteService(body, provider, chainName);
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
        const chainName = chainFromRequest(params?.chain);
        const provider = providerForChain(chainName);
        const { transaction } = await swapService(body, provider, chainName);
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
        const chainName = chainFromRequest(params?.chain);
        const provider = providerForChain(chainName);
        const { transaction } = await swapService(body, provider, chainName);
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
    // console.log("Token List accessed");
    try {

        //parse the data
        const { params } = req
        const chainName = chainFromRequest(typeof params.chain === "string" ? params.chain : undefined);
        const provider = providerForChain(chainName);
        const result = await tokenList(provider, chainName);

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
    // console.log("Token List accessed");
    try {

        //parse the data
        const { params } = TokenPriceRequestSchema.parse(req);
        const chainName = chainFromRequest(params.chain);
        const provider = providerForChain(chainName);

        const result = await getTokenPriceService(params.tokenAddress, provider, chainName);

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
    // console.log("Token List accessed");
    try {

        //parse the data
        const { params } = TokenDetailsRequestSchema.parse(req);
        const chainName = chainFromRequest(params.chain);
        const provider = providerForChain(chainName);

        const result = await getTokenDetailsService(params.tokenAddress, provider, chainName);

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
        const chainName = chainFromRequest(typeof params.chain === "string" ? params.chain : undefined);
        const provider = providerForChain(chainName);
        const result = await tokenListWithDetailsService(provider, chainName);

        res.send({ result });
    } catch (error) {
        console.log("Error in tokenListWithDetails", { error });
        next(error);
    }
};
