"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//here i will import all the routes, then export the list of routes out to the server to use in setting up the server
const swap_routes_1 = __importDefault(require("./swap/swap.routes"));
const routers = [swap_routes_1.default];
exports.default = routers;
