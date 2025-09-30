"use strict";
// i will implement dijkstra's algorithm here
Object.defineProperty(exports, "__esModule", { value: true });
exports.Edge = void 0;
const pQueue_1 = require("./pQueue");
const comparatorFunction = (a, b) => a.p - b.p;
/**
 *
 * @param graph
 * @param from
 * this will return a list of the distance of all the node from the @param from
 */
const dijkstraAlgorithmList = (graph, from) => {
    const queue = new pQueue_1.PriorityQueue(comparatorFunction);
    const visited = Array(graph.length).fill(false);
    const dist = Array(graph.length).fill(Infinity);
    //we will ad the first element to the queue
    queue.enqueue({ i: from, p: graph[from][0].edgeData.cost });
    dist[from] = 0;
    while (!queue.isEmpty()) {
        console.log("queue: ", queue);
        const currentNode = queue.dequeue();
        console.log("currentNode: ", currentNode);
        visited[currentNode.i] = true;
        for (let i = 0; i < graph[currentNode.i].length; i++) {
            const e = graph[currentNode.i][i];
            //e.form is the current node while e.to is the node we are checking it's distance
            // console.log("e: ", e);
            // we will have to compare the total cost, which is equal to the cost to get to the current node (e.from) plus the cost of going to the destination node (e.to)
            const nodeCost = dist[e.from] + e.edgeData.cost;
            if (nodeCost < dist[e.to]) {
                dist[e.to] = e.edgeData.cost + dist[e.from];
            }
            //now enqueue the nodes that you have compared, while ignoring the ones that has already been visited
            if (!visited[e.to]) {
                queue.enqueue({ i: e.to, p: e.edgeData.cost });
            }
            // if (testingCount >= testLimitCount) break;
        }
    }
    return dist;
    // const visited
};
const reconstructPath = (from, to, prev) => {
    const reconstructed = [];
    let count = 0;
    for (let i = to; i != null; i = prev[i]) {
        if (count > prev.length) {
            break;
        }
        reconstructed.push(i);
        count++;
    }
    return reconstructed.reverse();
};
const dijkstraAlgorithm = (graph, from, to) => {
    console.log("graph: ", graph.length);
    if (from > graph.length || to > graph.length)
        throw new Error("Start and or end is out of bounds on graph");
    const queue = new pQueue_1.PriorityQueue(comparatorFunction);
    const visited = Array(graph.length).fill(false);
    const dist = Array(graph.length).fill(Infinity);
    const prev = [];
    //we will ad the first element to the queue
    queue.enqueue({ i: from, p: graph[from][0].edgeData.cost });
    dist[from] = 0;
    while (!queue.isEmpty()) {
        // console.log("queue: ", queue);
        const currentNode = queue.dequeue();
        visited[currentNode.i] = true;
        for (let i = 0; i < graph[currentNode.i].length; i++) {
            const e = graph[currentNode.i][i];
            //e.form is the current node while e.to is the node we are checking it's distance
            // we will have to compare the total cost, which is equal to the cost to get to the current node (e.from) plus the cost of going to the destination node (e.to)
            const nodeCost = dist[e.from] + e.edgeData.cost;
            if (nodeCost < dist[e.to]) {
                dist[e.to] = nodeCost;
                prev[e.to] = e.from;
            }
            //now enqueue the nodes that you have compared, while ignoring the ones that has already been visited
            if (!visited[e.to]) {
                queue.enqueue({ i: e.to, p: e.edgeData.cost });
            }
            // if (testingCount >= testLimitCount) break;
        }
        if (currentNode.i === to) {
            const reconstructedPath = reconstructPath(from, to, prev);
            return { distance: dist, reconstructedPath };
        }
    }
    // const visited
};
const functionToMutateTheEdgeCost = (params) => {
    //so here do some calculations and then set params.cost to the final value that you want to return
    // we should normalize the returned value, this is because this algorithm does not have negative numbers well
    //so if we get negative number, we set it's value to zero
    let result = params.cost - params.key;
    result < 0 ? (result = 0) : (result = result);
    return result;
};
const dijkstraAlgorithmWithKey = (graph, from, to, key) => {
    console.log("graph: ", graph.length);
    if (from > graph.length || to > graph.length)
        throw new Error("Start and or end is out of bounds on graph");
    const queue = new pQueue_1.PriorityQueue(comparatorFunction);
    const visited = Array(graph.length).fill(false);
    const dist = Array(graph.length).fill(Infinity);
    const prev = [];
    //we will ad the first element to the queue
    queue.enqueue({
        i: from,
        p: functionToMutateTheEdgeCost({
            ...graph[from][0].edgeData,
            key,
        }),
    });
    dist[from] = 0;
    while (!queue.isEmpty()) {
        // console.log("queue: ", queue);
        const currentNode = queue.dequeue();
        visited[currentNode.i] = true;
        for (let i = 0; i < graph[currentNode.i].length; i++) {
            const e = graph[currentNode.i][i];
            //e.form is the current node while e.to is the node we are checking it's distance
            // we will have to compare the total cost, which is equal to the cost to get to the current node (e.from) plus the cost of going to the destination node (e.to)
            const nodeCost = dist[e.from] + functionToMutateTheEdgeCost({ ...e.edgeData, key });
            if (nodeCost < dist[e.to]) {
                dist[e.to] = nodeCost;
                prev[e.to] = e.from;
            }
            //now enqueue the nodes that you have compared, while ignoring the ones that has already been visited
            if (!visited[e.to]) {
                queue.enqueue({
                    i: e.to,
                    p: functionToMutateTheEdgeCost({ ...e.edgeData, key }),
                });
            }
            // if (testingCount >= testLimitCount) break;
        }
        if (currentNode.i === to) {
            const reconstructedPath = reconstructPath(from, to, prev);
            return { distance: dist, reconstructedPath };
        }
    }
    // const visited
};
class Node {
    constructor(id, value) {
        this.id = id;
        this.value = value;
    }
}
class Edge {
    constructor(from, to, edgeData) {
        this.from = from;
        this.to = to;
        this.edgeData = edgeData;
    }
}
exports.Edge = Edge;
const nodeToIndex = ["A", "B", "C", "D", "E", "F", "G"];
const nodesEdgesInfo = [
    [
        { to: 1, edgeData: { cost: 6 } },
        { to: 4, edgeData: { cost: 6 } },
        { to: 2, edgeData: { cost: 0 } },
    ],
    [
        { to: 0, edgeData: { cost: 7.5 } },
        { to: 3, edgeData: { cost: 0.1 } },
        { to: 5, edgeData: { cost: 17 } },
    ],
    [
        { to: 0, edgeData: { cost: 1 } },
        { to: 5, edgeData: { cost: 3 } },
    ],
    [
        { to: 1, edgeData: { cost: 0.5 } },
        { to: 5, edgeData: { cost: 2 } },
    ],
    [
        { to: 0, edgeData: { cost: 1.3 } },
        { to: 6, edgeData: { cost: 3.7 } },
    ],
    [
        { to: 1, edgeData: { cost: 10 } },
        { to: 2, edgeData: { cost: 6 } },
        { to: 3, edgeData: { cost: 1 } },
        { to: 6, edgeData: { cost: 1 } },
        { to: 7, edgeData: { cost: 5 } },
    ],
    [
        { to: 4, edgeData: { cost: 2 } },
        { to: 5, edgeData: { cost: 3 } },
    ],
    [{ to: 5, edgeData: { cost: 12 } }],
];
const nodesEdgesInfo1 = [
    [
        { to: 1, edgeData: { cost: 2 } },
        { to: 2, edgeData: { cost: 4 } },
    ],
    [
        { to: 0, edgeData: { cost: 2 } },
        { to: 2, edgeData: { cost: 1 } },
        { to: 3, edgeData: { cost: 7 } },
    ],
    [
        { to: 0, edgeData: { cost: 4 } },
        { to: 1, edgeData: { cost: 1 } },
        { to: 3, edgeData: { cost: 3 } },
        { to: 4, edgeData: { cost: 5 } },
    ],
    [
        { to: 1, edgeData: { cost: 7 } },
        { to: 2, edgeData: { cost: 3 } },
        { to: 4, edgeData: { cost: 2 } },
    ],
    [
        { to: 2, edgeData: { cost: 5 } },
        { to: 3, edgeData: { cost: 2 } },
    ],
];
const dijkstraAlgorithmWithKeyV2 = (graph, from, to, key, functionToMutateTheEdgeCost) => {
    if (from > graph.length || to > graph.length)
        throw new Error("Start and or end is out of bounds on graph");
    const queue = new pQueue_1.PriorityQueue(comparatorFunction);
    const visited = Array(graph.length).fill(false);
    const dist = Array(graph.length).fill(Infinity);
    const prev = [];
    // New array to store the edge used to update each node.
    const prevEdge = new Array(graph.length).fill(null);
    //we will ad the first element to the queue
    queue.enqueue({
        i: from,
        p: functionToMutateTheEdgeCost({
            ...graph[from][0].edgeData,
            key,
        }, graph[from][0]),
    });
    dist[from] = 0;
    while (!queue.isEmpty()) {
        // console.log("queue: ", queue);
        const currentNode = queue.dequeue();
        visited[currentNode.i] = true;
        let currentNodeCost = 0;
        for (let i = 0; i < graph[currentNode.i].length; i++) {
            const e = graph[currentNode.i][i];
            //e.form is the current node while e.to is the node we are checking it's distance
            // we will have to compare the total cost, which is equal to the cost to get to the current node (e.from) plus the cost of going to the destination node (e.to)
            let cost = functionToMutateTheEdgeCost({ ...e.edgeData, key }, e);
            const nodeCost = dist[e.from] + cost;
            if (nodeCost < dist[e.to]) {
                // console.log("nodeCost: ", nodeCost);
                dist[e.to] = nodeCost;
                prev[e.to] = e.from;
                prevEdge[e.to] = e;
            }
            //now enqueue the nodes that you have compared, while ignoring the ones that has already been visited
            if (!visited[e.to]) {
                queue.enqueue({
                    i: e.to,
                    p: cost,
                });
            }
            // if (testingCount >= testLimitCount) break;
        }
        if (currentNode.i === to) {
            // console.log("prev: ", prev);
            const reconstructedPath = reconstructPath(from, to, prev);
            // Reconstruct the list of edges corresponding to the path.
            const reconstructedEdges = [];
            for (let i = 1; i < reconstructedPath.length; i++) {
                const node = reconstructedPath[i];
                if (!prevEdge[node]) {
                    throw new Error("Missing edge data during path reconstruction");
                }
                reconstructedEdges.push(prevEdge[node]);
            }
            return { distance: dist, reconstructedPath, reconstructedEdges };
        }
    }
    console.log("reached the end of the graph");
    // const visited
};
let graph = [];
for (let i = 0; i < nodesEdgesInfo.length; i++) {
    const indexEdges = nodesEdgesInfo[i].map((e) => new Edge(i, e.to, e.edgeData));
    graph.push(indexEdges);
}
const res = dijkstraAlgorithmWithKeyV2(graph, 0, 6, 2, functionToMutateTheEdgeCost);
