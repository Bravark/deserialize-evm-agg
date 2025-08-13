import { ErrorRequestHandler } from "express";

import { z } from "zod";

import { ApiError } from "../errors/errors.api";
import { HTTPStatusCode } from "../errors/errors.enum";
import { env } from "../config";
// import { Prisma } from "../consolidate/prisma/generated/client";

export const errorConverter: ErrorRequestHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {

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
    const statusCode =
      typeof error.statusCode === "number" ? error.statusCode : 500;
    const message = error.message || "Internal Server Error";

    error = new ApiError(
      statusCode,
      message,
      error instanceof Error ? error : undefined,
      false,
      error.stack || undefined
    );
    // }
  }

  next(error);
};



export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof z.ZodError) {
    // Return validation errors as response
    console.log(" THIS IS ZOD ERROR ========== err.message: ", err.message);
    err = new ApiError(HTTPStatusCode.BadRequest, err.message);
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
    ...(env.NODE_ENV === "development" && {
      stack: err.stack,
      cause: err.cause instanceof Error ? err.cause.message : err.cause,
      errors: err.errors || undefined,
    }),
  };

  if (env.NODE_ENV === "development") {
    console.error("THIS ERROR WILL ONLY LOG IN DEVELOPMENT", err);
  }

  res.status(statusCode).json(response);
};

