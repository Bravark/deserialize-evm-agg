export interface LocalPool {
  poolAddress: string;
  reversed: boolean;
  dexId: DexIdTypes;
}
export interface RouteOptions {
  targetRouteNumber: number;
}

export const DEX_IDS = {
  ZERO_G: "ZERO_G",
} as const;

export type DexIdTypes = (typeof DEX_IDS)[keyof typeof DEX_IDS];
