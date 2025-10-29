//here i want to get the route plan from an swap request

import { getBestRoutes } from "./apps/server/src"
import { JsonRpcProvider } from "ethers"
import { NetworkType } from "./providers/routeProviders/constants"
import { getChainFromName } from "./providers/routeProviders"
const input = {

}
const testQuote = async () => {
    const network: NetworkType = "BASE"
    const fromTokenString = "0x4200000000000000000000000000000000000006"
    const toTokenString = "0x590830dFDf9A3F68aFCDdE2694773dEBDF267774"
    const amount = 0
    const provider = new JsonRpcProvider(getChainFromName(network).rpcUrl)
    const route = await getBestRoutes(network, fromTokenString, toTokenString, amount, provider)
    // console.log('route: ', route.routes);
    // const toBiMap = await route.RouteJsonRpcProvider.getTokenBiMap()
    // const tokenAIndex = toBiMap.tokenBiMap.getByValue(fromTokenString.toLowerCase());
    // console.log('tokenAIndex: ', tokenAIndex);
    // const tokenBIndex = toBiMap.tokenBiMap.getByValue(toTokenString.toLowerCase());
    // console.log('tokenBIndex: ', tokenBIndex);
    // const graph = await route.RouteJsonRpcProvider.getGraph();
    // console.log('graph:', graph);
    // const edges = graph[tokenBIndex!];
    // console.log('edges: ', edges);
    // console.log('edges: ', edges.filter(edge => (edge.edgeData as any).pool.token0.address.toLowerCase() === toTokenString.toLowerCase() || (edge.edgeData as any).pool.token1.address.toLowerCase() === toTokenString.toLowerCase()));
    // console.log('edges: ', edges.length);


    return

    const { newGraph } = await route.RouteJsonRpcProvider.findUpdateTokenPairPools(fromTokenString, toTokenString)
    console.log('graph:', newGraph);
}

testQuote()

