export class BiMap<K, V> {
  keyToValue: Map<K, V>;
  valueToKey: Map<V, K>;
  n: number = 0;

  constructor(initialData: Map<K, V> = new Map()) {
    this.keyToValue = new Map<K, V>();
    this.valueToKey = new Map<V, K>();

    for (const [key, value] of initialData) {
      this.set(key, value);
    }
  }

  set(key: K, value: V): boolean {
    // Avoid duplicate keys or values
    if (this.keyToValue.has(key) || this.valueToKey.has(value)) {
      return false;
    }
    this.keyToValue.set(key, value);
    this.valueToKey.set(value, key);
    this.n++;
    return true;
  }

  get(key: K): V | undefined {
    return this.keyToValue.get(key);
  }

  getByValue(value: V): K | undefined {
    return this.valueToKey.get(value);
  }

  delete(key: K): boolean {
    if (this.keyToValue.has(key)) {
      const value = this.keyToValue.get(key)!;
      this.keyToValue.delete(key);
      this.valueToKey.delete(value);
      this.n--;
      return true;
    }
    return false;
  }

  deleteByValue(value: V): boolean {
    if (this.valueToKey.has(value)) {
      const key = this.valueToKey.get(value)!;
      this.valueToKey.delete(value);
      this.keyToValue.delete(key);
      this.n--;
      return true;
    }
    return false;
  }

  has(key: K): boolean {
    return this.keyToValue.has(key);
  }

  hasValue(value: V): boolean {
    return this.valueToKey.has(value);
  }

  getKeys(): K[] {
    return Array.from(this.keyToValue.keys());
  }

  getValues(): V[] {
    return Array.from(this.valueToKey.keys());
  }

  getMapLength(): number {
    return this.n;
  }
}

export class ArrayBiMap<V> extends BiMap<number, V> {
  constructor(initialData: V[] = []) {
    const initialMap = new Map<number, V>(
      initialData.map((value, index) => [index, value])
    );
    super(initialMap);
  }

  setArrayValue(value: V): boolean {
    const key = this.getByValue(value);
    if (key !== undefined) {
      return this.set(key, value); // Updates the existing entry
    }
    return this.set(this.getMapLength(), value); // Adds a new entry
  }

  indexOf(value: V): number | undefined {
    return this.valueToKey.get(value);
  }

  removeAt(index: number): boolean {
    const value = this.keyToValue.get(index);
    if (value !== undefined) {
      return super.delete(index);
    }
    return false;
  }

  insertAt(index: number, value: V): boolean {
    if (this.keyToValue.has(index)) {
      return false; // Prevent overwriting existing entries
    }
    return super.set(index, value);
  }

  toArray(): V[] {
    return this.getValues();
  }
}


export interface TokenBiMap<T> {
  tokenBiMap: ArrayBiMap<string>;
  data: T[];
  tokenPoolMap: Map<string, string>;
}

