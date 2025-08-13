type EdgeData = {
    cost: number;
};
export declare class Edge {
    from: any;
    to: any;
    edgeData: EdgeData;
    constructor(from: number, to: number, edgeData: EdgeData);
}
export type Graph = Edge[][];
export {};
