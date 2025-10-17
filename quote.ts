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
    const toTokenString = "0x11A4ec8f460318FE7933C2005F090AcFbD73229a"
    const amount = 0
    const provider = new JsonRpcProvider(getChainFromName(network).rpcUrl)
    const route = await getBestRoutes(network, fromTokenString, toTokenString, amount, provider)
    console.log('route: ', route.routes);
}


testQuote()
