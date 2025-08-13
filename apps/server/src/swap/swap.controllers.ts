//controller logics here

import { NextFunction, Request, Response } from "express";
import { SwapQuoteRequestSchema } from "./swap.schema";
import { swapQuoteService } from "./swap.service";



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

        const { body } = SwapQuoteRequestSchema.parse(req);
        const swap = await swapQuoteService(body);
        console.log("Swap quote processed successfully", {
            amountOut: swap.amountOut.toString(),
        });

        res.send(swap);
    } catch (error) {
        console.log("Error in swapController", { error });
        next(error);
    }
};