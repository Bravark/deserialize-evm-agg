import { ethers } from "ethers";



(async () => {
    // const W0G = "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c"
    const W0G = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    const local = "http://localhost:3735"
    const prod = "http://evm-api.deserialize.xyz"
    const baseUrl = local
    const privateKey = "0xcd90354282b35344616d6b53684684bef6e8673ed601d562a5866dc67fafd1ef"
    const provider = new ethers.JsonRpcProvider("https://evmrpc.0g.ai");
    const wallet = new ethers.Wallet(privateKey, provider);
    const userInput = {
        tokenA: W0G,
        tokenB: "0x59ef6f3943bbdfe2fb19565037ac85071223e94c",
        amountIn: "10000000000000000",
        dexId: "ZERO_G"
    }
    const res = await fetch(`${baseUrl}/quote`, {
        method: "POST",
        body: JSON.stringify(userInput),
        headers: {
            "Content-Type": "application/json"
        }
    })

    const data = await res.json()
    // console.log("data: ", data)

    const quote = { ...data, dexId: "ALL" }
    const quoteData = { quote, publicKey: wallet.address, slippage: 0.5 }


    const swapRes = await fetch(`${baseUrl}/swap`, {
        method: "POST",
        body: JSON.stringify(quoteData),
        headers: {
            "Content-Type": "application/json"
        }
    })

    const swapData = await swapRes.json()
    // console.log("swapData: ", swapData)

    for (const tx of swapData.transactions) {
        // const signedTx = await wallet.signTransaction(tx);
        //send transaction
        console.log("tx: ", tx);
        const txResponse = await wallet.sendTransaction(tx)
        console.log("txResponse: ", txResponse);
        const receipt = await txResponse.wait();
        console.log("Transaction was mined in block ", await receipt?.getTransaction());

    }

    //you can sign and send the transaction here


})()




