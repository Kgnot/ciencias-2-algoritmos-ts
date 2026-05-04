import type {Comparable} from "./utils/Comparable.js";

export class Vertex<T> implements Comparable<Vertex<T>> {

    constructor(
        public id: string,
        private value: T, // value
    ) {}

    compareTo(other: Vertex<T>):
        number {
        // hacemos el tema de la comparacion jiji
        if (this.value < other.value) return -1;
        if (this.value > other.value) return 1;
        return 0;
    }

    getValue(): T {
        return this.value;
    }
    toString(): string {
        return `Vertex(${this.id}, ${this.value})`;
    }
}
