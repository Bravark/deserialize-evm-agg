export type FunctionToMutateTheEdgeCostType<T extends EdgeData> = (params: FunctionEdgeData, e: Edge<T>) => number;
type FunctionEdgeData = EdgeData & {
    key: GraphKey;
};
type GraphKey = {
    key: number;
    keyRate: number;
    keyDecimal: number;
};
export interface EdgeData {
    cost?: number;
    price: number;
    priceUsdc: number;
    tokenFromReserve?: number;
    tokenToReserve?: number;
    tokenFromDecimals: number;
    tokenToDecimals: number;
    dexId: any;
    poolAddress: string;
    aToB: boolean;
    fee: number;
}
export declare class Edge<T extends EdgeData> {
    from: any;
    to: any;
    edgeData: T;
    constructor(from: number, to: number, edgeData: T);
}
export type Graph<T extends EdgeData = EdgeData> = Edge<T>[][];
/**
 * Modified findBestRouteIndex function to allow flexible route reduction
 */
export declare const findBestRouteIndex: <T extends EdgeData>(graph: Graph, fromIndex: number, toIndex: number, key: GraphKey, targetHops?: number, functionToMutateTheEdgeCost?: FunctionToMutateTheEdgeCostType<T>) => {
    bestOutcome: number;
    bestRoute: any[];
    edgeData: Edge<EdgeData>[];
};
export declare const checkIfGraphIsEmpty: (graph: Graph) => boolean;
export {};
