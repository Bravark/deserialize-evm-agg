import { NextFunction, Response, Request } from "express";
import { NotFoundException } from "./http.exception";

export const pageNotFoundExceptionHandler = (
  _req: Request,
  _res: Response,
  _next: NextFunction
) => {
  // this exception will be handled in the global exception middleware
  //log the route
  console.log("Route not found!", _req.url);
  throw new NotFoundException("Route not found!");
};
