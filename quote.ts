//here i want to get the route plan from an swap request

import { getBestRoutes } from "./apps/server/src"
import { JsonRpcProvider } from "ethers"
import { NetworkType } from "./providers/routeProviders/constants"
import { getChainFromName } from "./providers/routeProviders"
import Decimal from "decimal.js"
const input = {

}
const testQuote = async () => {
    const network: NetworkType = "BASE"
    const fromTokenString = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    const toTokenString = "0x1bc0c42215582d5A085795f4baDbaC3ff36d1Bcb"
    const amount = 1 * (10 ** 18)
    const provider = new JsonRpcProvider(getChainFromName(network).rpcUrl)
    const route = await getBestRoutes(network, fromTokenString, toTokenString, amount, provider)
    console.log('route: ', route.routes);
    const { amountOut, pools } = await route.RouteJsonRpcProvider.getAmountOutFromPlan(new Decimal(amount), route.routes, 0, provider)
    const finalRoutes = route.routes.map((r, i) => {
        return {
            ...r,
            poolAddress: pools[i]
        }
    })
    console.log('finalRoutes: ', finalRoutes);
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

