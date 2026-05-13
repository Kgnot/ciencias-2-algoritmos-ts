import type { Edge } from "../../../estructuras/edge.js";
import type { Graph } from "../../../estructuras/graph/graph.js";
import type { VertexID } from "../../../estructuras/vertex.js";
import { UnionFind } from "./union-find.js";

export class Kruskal<T> {
    private mstEdges: Edge<T>[] = [];
    private totalWeight: number = 0;
    private ran: boolean = false;

    constructor(private graph: Graph<T>) {
        this.run();
    }

    private run(): void {
        if (this.ran) return;
        this.ran = true;

        const vertices = this.graph.getVertex();
        const edges = this.graph.getUniqueEdges();

        // paso 1: ordenar aristas por peso ascendente
        const sorted = [...edges].sort((a, b) => a.weight - b.weight);

        // paso 2: inicializar union-find con todos los ids
        const uf = new UnionFind(vertices.map(v => v.id));

        // paso 3: iterar aristas en orden
        for (const edge of sorted) {
            const added = uf.union(edge.from.id, edge.to.id);
            if (added) {
                this.mstEdges.push(edge);
                this.totalWeight += edge.weight;
            }

            // ya tenemos N-1 aristas → MST completo
            if (this.mstEdges.length === vertices.length - 1) break;
        }
    }

    /** Aristas que forman el MST */
    getMSTEdges(): Edge<T>[] {
        return [...this.mstEdges];
    }

    /** Peso total del MST */
    getTotalWeight(): number {
        return this.totalWeight;
    }

    /** Retorna true si el grafo es conexo (el MST cubre todos los vértices) */
    isConnected(): boolean {
        return this.mstEdges.length === this.graph.getVertex().length - 1;
    }

    /** Camino entre dos nodos dentro del MST (BFS sobre el árbol) */
    getPath(fromId: VertexID, toId: VertexID): VertexID[] {
        if (!this.isConnected()) return [];

        // construir lista de adyacencia del MST (no dirigida)
        const adj = new Map<VertexID, VertexID[]>();
        for (const v of this.graph.getVertex()) adj.set(v.id, []);

        for (const e of this.mstEdges) {
            adj.get(e.from.id)!.push(e.to.id);
            adj.get(e.to.id)!.push(e.from.id);
        }

        // BFS
        const visited = new Set<VertexID>();
        const prev = new Map<VertexID, VertexID | null>();
        const queue: VertexID[] = [fromId];
        visited.add(fromId);
        prev.set(fromId, null);

        while (queue.length > 0) {
            const cur = queue.shift()!;
            if (cur === toId) break;
            for (const nb of adj.get(cur) ?? []) {
                if (!visited.has(nb)) {
                    visited.add(nb);
                    prev.set(nb, cur);
                    queue.push(nb);
                }
            }
        }

        // reconstruir camino
        const path: VertexID[] = [];
        let cur: VertexID | null | undefined = toId;
        while (cur != null) {
            path.unshift(cur);
            cur = prev.get(cur);
        }

        return path[0] === fromId ? path : [];
    }
}