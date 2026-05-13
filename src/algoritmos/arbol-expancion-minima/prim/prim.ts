import { Edge } from "../../../estructuras/edge.js";
import { Graph } from "../../../estructuras/graph/graph.js";
import { toUndirectedAdjacency } from "../../../estructuras/proyeccion/incidence_list.js";
import { Vertex } from "../../../estructuras/vertex.js";
import { PrimPriorityQueue } from "./prim_priority_queue.js";

export class Prim<T> {
    private mstEdges: Edge<T>[] = [];
    private totalWeight = 0;
    private ran = false;

    constructor(
        private graph: Graph<T>,
        private startVertexId?: string
    ) {
        this.run();
    }

    private getStartVertex(vertices: Vertex<T>[]): Vertex<T> {
        if (vertices.length === 0) {
            throw new Error("El grafo no contiene vertices");
        }

        if (this.startVertexId) {
            return this.graph.getVertexById(this.startVertexId);
        }

        const aleatorio = Math.floor(Math.random() * vertices.length);
        const vertice = vertices[aleatorio];
        if (!vertice) {
            throw new Error("No se pudo seleccionar un vertice inicial");
        }
        return vertice;
    }

    private run(): void {
        if (this.ran) return;
        this.ran = true;

        const vertices = this.graph.getVertex();
        if (vertices.length === 0) return;

        const adjacency = toUndirectedAdjacency(this.graph);
        const visitados = new Set<string>();
        const primPriorityQueue = new PrimPriorityQueue<T>();

        const start = this.getStartVertex(vertices);
        visitados.add(start.id);
        primPriorityQueue.addEdges(adjacency.get(start.id) ?? []);

        while (!primPriorityQueue.isEmpty() && this.mstEdges.length < vertices.length - 1) {
            const nextEdge = primPriorityQueue.getNextEdge();
            if (!nextEdge) break;

            if (visitados.has(nextEdge.to.id)) {
                continue;
            }

            this.mstEdges.push(nextEdge);
            this.totalWeight += nextEdge.weight;
            visitados.add(nextEdge.to.id);

            for (const edge of adjacency.get(nextEdge.to.id) ?? []) {
                if (!visitados.has(edge.to.id)) {
                    primPriorityQueue.addEdge(edge);
                }
            }
        }
    }

    getMSTEdges(): Edge<T>[] {
        return [...this.mstEdges];
    }

    getTotalWeight(): number {
        return this.totalWeight;
    }

    isConnected(): boolean {
        return this.mstEdges.length === this.graph.getVertex().length - 1;
    }

    getPath(fromId: string, toId: string): string[] {
        if (!this.isConnected()) return [];

        const adj = new Map<string, string[]>();
        for (const v of this.graph.getVertex()) adj.set(v.id, []);

        for (const e of this.mstEdges) {
            adj.get(e.from.id)?.push(e.to.id);
            adj.get(e.to.id)?.push(e.from.id);
        }

        const visited = new Set<string>();
        const prev = new Map<string, string | null>();
        const queue: string[] = [fromId];
        visited.add(fromId);
        prev.set(fromId, null);

        while (queue.length > 0) {
            const cur = queue.shift();
            if (!cur) break;
            if (cur === toId) break;

            for (const nb of adj.get(cur) ?? []) {
                if (!visited.has(nb)) {
                    visited.add(nb);
                    prev.set(nb, cur);
                    queue.push(nb);
                }
            }
        }

        if (!visited.has(toId)) return [];

        const path: string[] = [];
        let cur: string | null | undefined = toId;
        while (cur != null) {
            path.unshift(cur);
            cur = prev.get(cur);
        }

        return path;
    }
}

export function prim<T>(graph: Graph<T>, startVertexId?: string): Graph<T> {
    const result = new Prim(graph, startVertexId);
    const mst = new Graph<T>(false);

    for (const v of graph.getVertex()) {
        mst.addVertex(new Vertex<T>(v.id, v.getValue()));
    }

    for (const e of result.getMSTEdges()) {
        const from = mst.getVertexById(e.from.id);
        const to = mst.getVertexById(e.to.id);
        mst.addEdge(new Edge(from, to, e.weight, false));
    }

    return mst;
}