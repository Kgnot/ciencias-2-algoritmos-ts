import type {Comparable} from "./utils/Comparable.js";

export enum COLOR {
    RED = "red",
    GREEN = "green",
    BLUE = "blue",
    YELLOW = "yellow",
    ORANGE = "orange",
    PURPLE = "purple",
    CYAN = "cyan",
    MAGENTA = "magenta",
    BLACK = "black",
    WHITE = "white",
}

export type VertexID = string;


export class Vertex<T> implements Comparable<Vertex<T>> {

    constructor(
        public readonly id: VertexID,
        private value: T,
        private color: COLOR | string = COLOR.WHITE
    ) {
    }

    compareTo(other: Vertex<T>): number {
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

    setColor(color: COLOR | string): void {
        this.color = color;
    }

    getColor(): COLOR | string {
        return this.color;
    }
}