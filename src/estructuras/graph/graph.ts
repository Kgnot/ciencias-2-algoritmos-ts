import { Edge } from "../edge.js";
import { Vertex } from "../vertex.js";

export class Graph<T> {
    // el vertice es un mapa para acceder O(1) a vertices
    private vertex: Map<string, Vertex<T>> = new Map();
    private edges: Edge<T>[] = [];

    constructor(
        public directed: boolean = false
    ) { }

    addVertex(vertex: Vertex<T>): void {
        if (this.vertex.has(vertex.id)) {
            throw new Error(`Vertex ${vertex.id} already exists`);
        }
        this.vertex.set(vertex.id, vertex);
    }

    addEdge(edge: Edge<T>): void {
        if (!this.vertex.has(edge.from.id) || !this.vertex.has(edge.to.id)) {
            throw new Error("Both vertices must exist in graph");
        }

        this.edges.push(edge);

        if (!this.directed && edge.directed === false) {
            this.edges.push(
                new Edge(edge.to, edge.from, edge.weight, false)
            );
        }
    }

    getVertex(): Vertex<T>[] {
        return Array.from(this.vertex.values());
    }

    getEdges(): Edge<T>[] {
        return [...this.edges];
    }

    getVertexById(id: string): Vertex<T> {
        const v = this.vertex.get(id);
        if (!v) throw new Error(`Vertex ${id} not found`);
        return v;
    }

    getUniqueEdges(): Edge<T>[] {
        const seen = new Set<string>();
        return this.edges.filter(e => {
            const key = [e.from.id, e.to.id].sort().join('-');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }
}