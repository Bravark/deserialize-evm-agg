"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityQueue = void 0;
class PriorityQueue {
    constructor(comparator
    // = (a: T, b: T) =>
    //   a.priority - b.priority
    ) {
        // The comparator defines the priority (min-heap by default).
        this._heap = [];
        this._comparator = comparator;
    }
    // Get the size of the priority queue.
    size() {
        return this._heap.length;
    }
    // Check if the priority queue is empty.
    isEmpty() {
        return this.size() === 0;
    }
    // Peek at the highest priority element without removing it.
    peek() {
        return this.isEmpty() ? null : this._heap[0];
    }
    // Enqueue an element with `O(log n)` complexity.
    enqueue(item) {
        this._heap.push(item);
        this._siftUp();
    }
    // Dequeue the highest priority element with `O(log n)` complexity.
    dequeue() {
        if (this.isEmpty())
            return null;
        const root = this._heap[0];
        const last = this._heap.pop();
        if (!this.isEmpty()) {
            this._heap[0] = last;
            this._siftDown();
        }
        return root;
    }
    // Converts the heap into a sorted array (useful for debugging or verification).
    toArray() {
        return [...this._heap].sort(this._comparator);
    }
    // Private methods for heap maintenance.
    _siftUp() {
        let nodeIndex = this.size() - 1;
        const item = this._heap[nodeIndex];
        while (nodeIndex > 0) {
            const parentIndex = Math.floor((nodeIndex - 1) / 2);
            const parent = this._heap[parentIndex];
            // If item has higher priority than parent, swap.
            if (this._comparator(item, parent) >= 0)
                break;
            this._heap[nodeIndex] = parent;
            nodeIndex = parentIndex;
        }
        this._heap[nodeIndex] = item;
    }
    _siftDown() {
        let nodeIndex = 0;
        const length = this.size();
        const item = this._heap[nodeIndex];
        while (true) {
            const leftChildIndex = 2 * nodeIndex + 1;
            const rightChildIndex = 2 * nodeIndex + 2;
            let smallest = nodeIndex;
            if (leftChildIndex < length &&
                this._comparator(this._heap[leftChildIndex], this._heap[smallest]) < 0) {
                smallest = leftChildIndex;
            }
            if (rightChildIndex < length &&
                this._comparator(this._heap[rightChildIndex], this._heap[smallest]) < 0) {
                smallest = rightChildIndex;
            }
            if (smallest === nodeIndex)
                break;
            this._heap[nodeIndex] = this._heap[smallest];
            nodeIndex = smallest;
        }
        this._heap[nodeIndex] = item;
    }
}
exports.PriorityQueue = PriorityQueue;
