"use strict";
//controller logics here
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapQuoteController = void 0;
const swap_schema_1 = require("./swap.schema");
const swap_service_1 = require("./swap.service");
const swapQuoteController = async (req, res, next) => {
    console.log("Swap endpoint accessed");
    try {
        const data = req.body;
        console.log("data: ", data);
        //parse the data
        const { body } = swap_schema_1.SwapQuoteRequestSchema.parse(req);
        const swap = await (0, swap_service_1.swapQuoteService)(body);
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
