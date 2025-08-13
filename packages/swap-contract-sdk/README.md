# DESERIALIZE-EVM-SDK

---

This is an SDK helps to create a transaction on the backend, using the quote data, the user can then sign and send on the frontend

## Installation

```bash
npm install deserialize-evm-server-sdk
```

## Usage

The package is a function that takes in 2 parameters:

- { path , amountInRaw , minAmountOut } : The first parameter is an object that hold the path, amountInRaw ( in exponent of the toke decimal ) and minAmountOut ( in exponent of the toke decimal )

- walletAddress: The caller's wallet address

```js


import {createSwapTX} from "deserialize-evm-server-sdk";
...

export async function POST(req:NextRequest){
    try{
const {amountInRaw,minAmountOut,path,walletAddress} = await req.json()
const tx = await createSwapTX({amountInRaw,minAmountOut,path},walletAddress);

return NextResponse.json({tx})
    }catch(err:any){
       .... // catch logic
    }

}
```

## Releases

Changes would be recorded in the CHANGELOG.md
