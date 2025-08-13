"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.errorConverter = void 0;
const zod_1 = require("zod");
const errors_api_1 = require("../errors/errors.api");
const errors_enum_1 = require("../errors/errors.enum");
const config_1 = require("../config");
// import { Prisma } from "../consolidate/prisma/generated/client";
const errorConverter = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof errors_api_1.ApiError)) {
        // if (error instanceof Prisma.PrismaClientKnownRequestError) {
        //   switch (error.code) {
        //     case "P2002":
        //       error = new ApiError(
        //         409,
        //         `Unique constraint violation on field ${error.meta!.target
        //         }, and model ${error.meta!.modelName}`,
        //         error instanceof Error ? error : undefined,
        //         false,
        //         error.stack || undefined
        //       );
        //       break;
        //     case "P2025":
        //       error = new ApiError(
        //         404,
        //         `Record not found, data : ${error.meta!.modelName}`,
        //         error instanceof Error ? error : undefined,
        //         false,
        //         error.stack || undefined
        //       );
        //       break;
        //     default:
        //       error = new ApiError(
        //         500,
        //         "Internal server error",
        //         error instanceof Error ? error : undefined,
        //         false,
        //         error.stack || undefined
        //       );
        //   }
        // } else {
        const statusCode = typeof error.statusCode === "number" ? error.statusCode : 500;
        const message = error.message || "Internal Server Error";
        error = new errors_api_1.ApiError(statusCode, message, error instanceof Error ? error : undefined, false, error.stack || undefined);
        // }
    }
    next(error);
};
exports.errorConverter = errorConverter;
const errorHandler = (err, req, res, next) => {
    if (err instanceof zod_1.z.ZodError) {
        // Return validation errors as response
        console.log(" THIS IS ZOD ERROR ========== err.message: ", err.message);
        err = new errors_api_1.ApiError(errors_enum_1.HTTPStatusCode.BadRequest, err.message);
    }
    let { statusCode, message } = err;
    //   if (env.NODE_ENV === "production" && err.isOperational === false) {
    //     statusCode = 500;
    //     message = "Internal Server Error";
    //   }
    //check and return if it is a zod error
    console.log("====================================");
    console.log(message);
    console.log("====================================");
    const response = {
        code: statusCode,
        message,
        ...(config_1.env.NODE_ENV === "development" && {
            stack: err.stack,
            cause: err.cause instanceof Error ? err.cause.message : err.cause,
            errors: err.errors || undefined,
        }),
    };
    if (config_1.env.NODE_ENV === "development") {
        console.error("THIS ERROR WILL ONLY LOG IN DEVELOPMENT", err);
    }
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
