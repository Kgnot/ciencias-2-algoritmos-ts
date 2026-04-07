export class Vertex<T> {
    constructor(
        public id: string,
        public value: T
    ) { }
    toString(): string {
        return `Vertex(${this.id}, ${this.value})`;
    }
}
