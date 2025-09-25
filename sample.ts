


(async () => {

    const privateKey = "Your private key"
    const wallet = new ethers.Wallet(privateKey);
    const userInput = {
        tokenA: "0x59ef6f3943bbdfe2fb19565037ac85071223e94c",
        tokenB: "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c",
        amountIn: "1000000000000000000",
        dexId: "ZERO_G"
    }

    const res = await fetch("https://evm-api.deserialize.xyz/quote", {
        method: "POST",
        body: JSON.stringify(userInput),
        headers: {
            "Content-Type": "application/json"
        }
    })

    const data = await res.json()
    console.log("data: ", data)

    const quote = { ...data, dexId: "ALL" }
    const quoteData = { quote, publicKey: wallet.address, slippage: 0.5 }


    const swapRes = await fetch("https://evm-api.deserialize.xyz/swap", {
        method: "POST",
        body: JSON.stringify(quoteData),
        headers: {
            "Content-Type": "application/json"
        }
    })

    const swapData = await swapRes.json()
    console.log("swapData: ", swapData)

    //you can sign and send the transaction here


})()




