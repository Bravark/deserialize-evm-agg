export declare class PriorityQueue<T> {
    _heap: T[];
    _comparator: (a: T, b: T) => number;
    constructor(comparator: (a: T, b: T) => number);
    size(): number;
    isEmpty(): boolean;
    peek(): T;
    enqueue(item: T): void;
    dequeue(): T;
    toArray(): T[];
    _siftUp(): void;
    _siftDown(): void;
}
