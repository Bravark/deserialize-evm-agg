import { ethers } from "ethers";



(async () => {
    // const W0G = "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c"
    const NATIVE = "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c"
    const W0G = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"

    const local = "http://localhost:3735"
    const prod = "http://evm-api.deserialize.xyz"
    const baseUrl = prod
    const privateKey = "0xcd90354282b35344616d6b53684684bef6e8673ed601d562a5866dc67fafd1ef"
    const provider = new ethers.JsonRpcProvider("https://evmrpc.0g.ai");
    const wallet = new ethers.Wallet(privateKey, provider);

    const userInput = {
        tokenA: W0G,
        tokenB: "0x59ef6f3943bbdfe2fb19565037ac85071223e94c",
        amountIn: "100000000000000000",
        dexId: "ZERO_G"
    }

    // const userInput = {
    //     tokenA: "0x59ef6f3943bbdfe2fb19565037ac85071223e94c",
    //     tokenB: W0G,
    //     amountIn: "100000000000",
    //     dexId: "ALL"
    // }

    const res = await fetch(`${baseUrl}/quote`, {
        method: "POST",
        body: JSON.stringify(userInput),
        headers: {
            "Content-Type": "application/json"
        }
    })

    const data = await res.json()
    console.log("data: ", data)

    const quote = { ...data, dexId: "ALL" }
    const quoteData = {
        quote, publicKey: wallet.address, slippage: 0.5,
        // partnerFees: { recipient: "0x3766c4a45e7a73874dbcaa51b1d73627cb9b9c1b", fee: 1 }
    }


    const swapRes = await fetch(`${baseUrl}/swap`, {
        method: "POST",
        body: JSON.stringify(quoteData),
        headers: {
            "Content-Type": "application/json"
        }
    })

    const swapData = await swapRes.json()
    console.log("swapData: ", swapData)

    for (const tx of swapData.transactions) {
        // const signedTx = await wallet.signTransaction(tx);
        //send transaction
        console.log("tx: ", tx);

        // return
        const txResponse = await wallet.sendTransaction({ ...tx })
        console.log("txResponse: ", txResponse);
        const receipt = await txResponse.wait();
        console.log("Transaction was mined in block ", await receipt?.getTransaction());

    }

    //you can sign and send the transaction here


})

"


//       poolAddress: '0x9851711E9F9d5e4f5959daD835556c0BfbdB0e63',

//       wp:  {
//   token0: {
//     address: '0x1Cd0690fF9a693f5EF2dD976660a8dAFc81A109c',
//     decimals: 18,
//     symbol: 'W0G'
//   },
//   token1: {
//     address: '0x59ef6F3943bBdFE2fB19565037Ac85071223E94C',
//     decimals: 9,
//     symbol: 'PAI'
//   },
//   poolAddress: '0x224D0891D63Ca83e6DD98B4653C27034503a5E76',
//   slot0: [ 7.096599717913619e+25, -140365, 0, 1, 1, 0, true ],
//   sqrtPriceX96: '70965997179136196125916408',
//   fee: 3000,
//   liquidity: '22565495556427433201'
// }

// wp:  {
//   token0: {
//     address: '0x1Cd0690fF9a693f5EF2dD976660a8dAFc81A109c',
//     decimals: 18,
//     symbol: 'W0G'
//   },
//   token1: {
//     address: '0x59ef6F3943bBdFE2fB19565037Ac85071223E94C',
//     decimals: 9,
//     symbol: 'PAI'
//   },
//   poolAddress: '0x3D6c315511bC5c0DE4d6b51562608C36e86E9Aa6',
//   slot0: [ 7.035370005471613e+25, -140539, 0, 1, 1, 0, true ],
//   sqrtPriceX96: '70353700054716134831890743',
//   fee: 500,
//   liquidity: '2655127325312738'
// }