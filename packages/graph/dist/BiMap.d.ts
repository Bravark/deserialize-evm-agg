export declare class BiMap<K, V> {
    keyToValue: Map<K, V>;
    valueToKey: Map<V, K>;
    n: number;
    constructor(initialData?: Map<K, V>);
    set(key: K, value: V): boolean;
    get(key: K): V | undefined;
    getByValue(value: V): K | undefined;
    delete(key: K): boolean;
    deleteByValue(value: V): boolean;
    has(key: K): boolean;
    hasValue(value: V): boolean;
    getKeys(): K[];
    getValues(): V[];
    getMapLength(): number;
}
export declare class ArrayBiMap<V> extends BiMap<number, V> {
    constructor(initialData?: V[]);
    setArrayValue(value: V): boolean;
    indexOf(value: V): number | undefined;
    removeAt(index: number): boolean;
    insertAt(index: number, value: V): boolean;
    toArray(): V[];
}
export interface TokenBiMap<T> {
    tokenBiMap: ArrayBiMap<string>;
    data: T[];
    tokenPoolMap: Map<string, string>;
}
