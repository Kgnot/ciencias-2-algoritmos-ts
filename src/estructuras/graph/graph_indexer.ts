import type { Vertex, VertexID } from "../vertex";

export class GraphIndexer<T> {
    private indexMap: Map<string, number> = new Map();
    private reverseMap: Vertex<T>[] = [];

    constructor(vertices: Vertex<T>[]) {
        vertices.forEach((v, i) => {
            this.indexMap.set(v.id.value, i);
            this.reverseMap[i] = v;
        });
    }

    getIndex(id: string | VertexID): number {
        const key = typeof id === "string" ? id : id.value;
        const idx = this.indexMap.get(key);
        if (idx === undefined) throw new Error("Vertex not indexed");
        return idx;
    }

    getVertex(index: number): Vertex<T> {
        if (this.reverseMap[index] === undefined) throw new Error("Index out of bounds");

        return this.reverseMap[index];
    }

    size(): number {
        return this.reverseMap.length;
    }
}