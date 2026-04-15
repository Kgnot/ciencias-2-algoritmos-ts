import type { Comparable } from "./utils/Comparable.js";
import type { Vertex } from "./vertex.js";

export class Edge<T> implements Comparable<Edge<T>> {
    public from: Vertex<T>;
    public to: Vertex<T>;
    public weight: number;
    public directed: boolean;

    constructor(
        from: Vertex<T>,
        to: Vertex<T>,
        weight: number = 1,
        directed: boolean = false
    ) {
        this.from = from;
        this.to = to;
        this.weight = weight;
        this.directed = directed;
    }
    compareTo(other: Edge<T>): number {
        if (this.weight < other.weight) return -1;
        if (this.weight > other.weight) return 1;
        return 0;
    }

    toString(): string {
        return `Edge(${this.from.id} -> ${this.to.id}, weight: ${this.weight}, directed: ${this.directed})`;
    }
}