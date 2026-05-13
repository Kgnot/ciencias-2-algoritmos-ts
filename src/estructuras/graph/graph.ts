import { Edge } from "../edge.js";
import { Vertex, VertexID } from "../vertex.js";

export class Graph<T> {
    // el vertice es un mapa para acceder O(1) a vertices
    private vertex: Map<string, Vertex<T>> = new Map();
    private edges: Edge<T>[] = [];

    constructor(
        public directed: boolean = false
    ) {
    }

    private normalizeId(id: string | VertexID): string {
        return typeof id === "string" ? id : id.value;
    }

    addVertex(vertex: Vertex<T>): void {
        const id = vertex.id.value;
        if (this.vertex.has(id)) {
            throw new Error(`Vertex ${id} already exists`);
        }
        this.vertex.set(id, vertex);
    }

    addEdge(edge: Edge<T>): void {
        const fromId = edge.from.id.value;
        const toId = edge.to.id.value;
        if (!this.vertex.has(fromId) || !this.vertex.has(toId)) {
            throw new Error("Both vertices must exist in graph");
        }

        this.edges.push(edge);

        if (!this.directed && !edge.directed) {
            this.edges.push(
                new Edge(edge.to, edge.from, edge.weight, false, edge.maxFlow)
            );
        }
    }

    isDirected(): boolean {
        return this.directed;
    }
    getVertex(): Vertex<T>[] {
        return Array.from(this.vertex.values());
    }

    getEdges(): Edge<T>[] {
        return [...this.edges];
    }

    getVertexById(id: string | VertexID): Vertex<T> {
        const key = this.normalizeId(id);
        const v = this.vertex.get(key);
        if (!v) throw new Error(`Vertex ${key} not found`);
        return v;
    }

    getUniqueEdges(): Edge<T>[] {
        const seen = new Set<string>();
        return this.edges.filter(e => {
            const key = [e.from.id.value, e.to.id.value].sort().join('-');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    get vertexCount(): number {
        return this.vertex.size;
    }

    get edgeCount(): number {
        return this.edges.length;
    }
}