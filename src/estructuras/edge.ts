import type {Comparable} from "./utils/Comparable.js";
import type {Vertex} from "./vertex.js";

export class Edge<T> implements Comparable<Edge<T>> {
    private tupleFlow: [number, number]; // [flowGiven, maxFlow]
    constructor(
        public from: Vertex<T>,
        public to: Vertex<T>,
        public readonly weight: number = 1,
        public directed: boolean = false,
        public readonly maxFlow: number,
    ) {
        this.from = from;
        this.to = to;
        this.weight = weight;
        this.directed = directed;
        this.tupleFlow = [0, maxFlow];
    }

    compareTo(other: Edge<T>): number {
        if (this.weight < other.weight) return -1;
        if (this.weight > other.weight) return 1;
        return 0;
    }


    getMaxFlow() {
        return this.tupleFlow[1];
    }

    getFlowGiven() {
        return this.tupleFlow[0];
    }

    setFlowGiven(value: number): void {
        if (value < 0 || value > this.maxFlow) {
            throw new Error("Flow out of bounds");
        }
        this.tupleFlow = [value, this.maxFlow];
    }


    toString(): string {
        return `Edge(${this.from.id.value} -> ${this.to.id.value}, weight: ${this.weight}, directed: ${this.directed})`;
    }
}