"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pageNotFoundExceptionHandler = void 0;
const http_exception_1 = require("./http.exception");
const pageNotFoundExceptionHandler = (_req, _res, _next) => {
    // this exception will be handled in the global exception middleware
    //log the route
    console.log("Route not found!", _req.url);
    throw new http_exception_1.NotFoundException("Route not found!");
};
exports.pageNotFoundExceptionHandler = pageNotFoundExceptionHandler;
