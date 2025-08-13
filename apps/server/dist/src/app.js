"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupApp = setupApp;
// app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const _1 = require(".");
async function setupApp(routes) {
    BigInt.prototype.toJSON = function () {
        const int = Number.parseInt(this.toString());
        return int ?? this.toString();
    };
    const app = (0, express_1.default)();
    const client = await (0, _1.initAndGetCache)();
    // Apply rate limiting to all requests
    // app.use(limiter);// done on the reverse proxy level
    // Middleware setup
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // Route setup
    app.use(...routes);
    // 404 error route
    // app.use("*", pageNotFoundExceptionHandler);
    // console.log('routes: ', routes);
    //Error handlers
    app.use(errorMiddleware_1.errorConverter);
    app.use(errorMiddleware_1.errorHandler);
    return app;
}
