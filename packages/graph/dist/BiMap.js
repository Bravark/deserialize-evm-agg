"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayBiMap = exports.BiMap = void 0;
class BiMap {
    constructor(initialData = new Map()) {
        this.n = 0;
        this.keyToValue = new Map();
        this.valueToKey = new Map();
        for (const [key, value] of initialData) {
            this.set(key, value);
        }
    }
    set(key, value) {
        // Avoid duplicate keys or values
        if (this.keyToValue.has(key) || this.valueToKey.has(value)) {
            return false;
        }
        this.keyToValue.set(key, value);
        this.valueToKey.set(value, key);
        this.n++;
        return true;
    }
    get(key) {
        return this.keyToValue.get(key);
    }
    getByValue(value) {
        return this.valueToKey.get(value);
    }
    delete(key) {
        if (this.keyToValue.has(key)) {
            const value = this.keyToValue.get(key);
            this.keyToValue.delete(key);
            this.valueToKey.delete(value);
            this.n--;
            return true;
        }
        return false;
    }
    deleteByValue(value) {
        if (this.valueToKey.has(value)) {
            const key = this.valueToKey.get(value);
            this.valueToKey.delete(value);
            this.keyToValue.delete(key);
            this.n--;
            return true;
        }
        return false;
    }
    has(key) {
        return this.keyToValue.has(key);
    }
    hasValue(value) {
        return this.valueToKey.has(value);
    }
    getKeys() {
        return Array.from(this.keyToValue.keys());
    }
    getValues() {
        return Array.from(this.valueToKey.keys());
    }
    getMapLength() {
        return this.n;
    }
}
exports.BiMap = BiMap;
class ArrayBiMap extends BiMap {
    constructor(initialData = []) {
        const initialMap = new Map(initialData.map((value, index) => [index, value]));
        super(initialMap);
    }
    setArrayValue(value) {
        const key = this.getByValue(value);
        if (key !== undefined) {
            return this.set(key, value); // Updates the existing entry
        }
        return this.set(this.getMapLength(), value); // Adds a new entry
    }
    indexOf(value) {
        return this.valueToKey.get(value);
    }
    removeAt(index) {
        const value = this.keyToValue.get(index);
        if (value !== undefined) {
            return super.delete(index);
        }
        return false;
    }
    insertAt(index, value) {
        if (this.keyToValue.has(index)) {
            return false; // Prevent overwriting existing entries
        }
        return super.set(index, value);
    }
    toArray() {
        return this.getValues();
    }
}
exports.ArrayBiMap = ArrayBiMap;
