import type { Edge } from "../../estructuras/edge.js";
import type { Graph } from "../../estructuras/graph/graph.js";
import { MinHeap } from "./min_heap.js";

export class Prim<T> {
    private mstEdges: Edge<T>[] = [];
    private totalWeight: number = 0;
    private ran: boolean = false;

    constructor(
        private graph: Graph<T>,
        private startId?: string
    ) {
        this.run();
    }

    private run(): void {
        if (this.ran) return;
        this.ran = true;

        const vertices = this.graph.getVertex();
        if (vertices.length === 0) return;

        // lista de adyacencia del grafo original
        const adj = new Map<string, Edge<T>[]>();
        for (const v of vertices) adj.set(v.id, []);
        for (const e of this.graph.getUniqueEdges()) {
            adj.get(e.from.id)!.push(e);
            adj.get(e.to.id)!.push(
                // arista inversa para recorrer en ambas direcciones
                { from: e.to, to: e.from, weight: e.weight, directed: false } as Edge<T>
            );
        }

        const inMST = new Set<string>();
        const heap = new MinHeap<Edge<T>>();

        // nodo de inicio: el indicado o el primero del grafo
        const startId = this.startId ?? vertices[0]!.id;
        inMST.add(startId);

        // meter todas las aristas del nodo inicial
        for (const e of adj.get(startId) ?? []) {
            heap.push(e, e.weight);
        }

        while (heap.size > 0 && this.mstEdges.length < vertices.length - 1) {
            const edge = heap.pop()!;

            // si el destino ya está en el MST, saltar
            if (inMST.has(edge.to.id)) continue;

            // arista más barata que conecta un nodo nuevo → añadir
            inMST.add(edge.to.id);
            this.mstEdges.push(edge);
            this.totalWeight += edge.weight;

            // meter aristas del nuevo nodo hacia nodos aún fuera del MST
            for (const e of adj.get(edge.to.id) ?? []) {
                if (!inMST.has(e.to.id)) heap.push(e, e.weight);
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

    /** Camino entre dos nodos dentro del MST (BFS sobre el árbol) */
    getPath(fromId: string, toId: string): string[] {
        if (!this.isConnected()) return [];

        const adj = new Map<string, string[]>();
        for (const v of this.graph.getVertex()) adj.set(v.id, []);
        for (const e of this.mstEdges) {
            adj.get(e.from.id)!.push(e.to.id);
            adj.get(e.to.id)!.push(e.from.id);
        }

        const visited = new Set<string>();
        const prev = new Map<string, string | null>();
        const queue = [fromId];
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

        const path: string[] = [];
        let cur: string | null | undefined = toId;
        while (cur != null) {
            path.unshift(cur);
            cur = prev.get(cur);
        }

        return path[0] === fromId ? path : [];
    }
}