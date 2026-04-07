import type { Vertex } from "./vertex.js";

export class Edge<T> {
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

    toString(): string {
        return `Edge(${this.from.id} -> ${this.to.id}, weight: ${this.weight}, directed: ${this.directed})`;
    }
}