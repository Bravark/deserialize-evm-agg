"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructHop = void 0;
const ethers_1 = require("ethers");
const adapterTracker_json_1 = __importDefault(require("../interfaces/js/adapterTracker.json"));
;
const fetchAdapter = async (factory, adapterTracker, provider) => {
    const adapterTrackerContract = new ethers_1.ethers.Contract(adapterTracker, adapterTracker_json_1.default, provider);
    return (await adapterTrackerContract.returnAdapter(factory));
};
const constructHop = async (paths, adapterTracker, provider) => {
    const usedFactories = new Map();
    const hops = [];
    for (let i = 0; i < paths.length; i++) {
        if (!usedFactories.has(paths[i].factory)) {
            const adapter = await fetchAdapter(paths[i].factory, adapterTracker, provider);
            usedFactories.set(paths[i].factory, adapter);
        }
        hops.push([
            ethers_1.ethers.getAddress(paths[i].tokenIn),
            ethers_1.ethers.getAddress(paths[i].tokenOut),
            ethers_1.ethers.getAddress(usedFactories.get(paths[i].factory)),
            ethers_1.ethers.getAddress(paths[i].poolAddress),
            "0"
        ]);
    }
    return hops;
};
exports.constructHop = constructHop;
//# sourceMappingURL=contructHop.js.map