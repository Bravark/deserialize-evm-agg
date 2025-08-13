import { Connection, PublicKey } from "@solana/web3.js";
import { getTokenPriceUsdOnInvariant } from "../invariantDataService";
import { getTokenPriceBest } from "../tokenPrice";
import NodeCache from "node-cache";

// const tokenPriceMap = new Map<string, number>();

const tokenPriceMap = new NodeCache({ stdTTL: 60 });

//setter and getter for token price map

export const getTokenPrice = (token: string): number | undefined => {
  return tokenPriceMap.get(token);
};

export const setTokenPrice = (token: string, price: number) => {
  tokenPriceMap.set(token, price);
};

export const getSureTokenPrice = async (
  token: PublicKey,
  connection: Connection
): Promise<number | null> => {
  const memoryPrice = getTokenPrice(token.toBase58());
  if (memoryPrice) {
    return memoryPrice;
  }
  const price = await getTokenPriceBest(token, connection);

  if (price) {
    setTokenPrice(token.toBase58(), price);

    return price;
  }
  return null;
};
