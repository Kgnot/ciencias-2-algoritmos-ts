import type { Graph } from "../../estructuras/graph/graph.js";
import type { GraphIndexer } from "../../estructuras/graph/graph_indexer.js";
import { toAdjacencyMatrix } from "../../estructuras/proyeccion/adjacency_matrix.js";

export class FloydWarshall<T> {
    private dist: number[][];
    private next: (number | null)[][];
    private indexer: GraphIndexer<T>;

    constructor(graph: Graph<T>) {
        const { matrix, indexer } = toAdjacencyMatrix(graph);

        this.dist = matrix.map(row => [...row]);
        this.indexer = indexer;

        const n = matrix.length;

        this.next = Array.from({ length: n }, () =>
            Array(n).fill(null)
        );

        this.initializeNext();
        this.run();
        this.detectNegativeCycle();
    }

    // ------------------------
    // Inicialización
    // ------------------------
    private initializeNext() {
        const n = this.dist.length;

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j && this.dist[i]![j] !== Infinity) {
                    this.next[i]![j] = j;
                }
            }
        }
    }

    // ------------------------
    // Algoritmo principal
    // ------------------------
    private run() {
        const n = this.dist.length;

        for (let k = 0; k < n; k++) {
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    const newDist = this.dist[i]![k]! + this.dist[k]![j]!;

                    if (newDist < this.dist[i]![j]!) {
                        this.dist[i]![j] = newDist;
                        this.next[i]![j]! = this.next[i]![k]!;
                    }
                }
            }
        }
    }

    // ------------------------
    // Ciclos negativos
    // ------------------------
    private detectNegativeCycle() {
        const n = this.dist.length;

        for (let i = 0; i < n; i++) {
            if (this.dist[i]![i]! < 0) {
                throw new Error("Negative cycle detected");
            }
        }
    }

    // ------------------------
    // API pública
    // ------------------------

    getDistance(fromId: string, toId: string): number {
        const i = this.indexer.getIndex(fromId);
        const j = this.indexer.getIndex(toId);
        return this.dist[i]![j]!;
    }

    getPath(fromId: string, toId: string): string[] {
        const i = this.indexer.getIndex(fromId);
        const j = this.indexer.getIndex(toId);

        if (this.next[i]![j] === null) return [];

        const path: string[] = [fromId];
        let current = i;

        while (current !== j) {
            current = this.next[current]![j]!;
            path.push(this.indexer.getVertex(current).id);
        }

        return path;
    }

    getAllDistances(): number[][] {
        return this.dist.map(row => [...row]);
    }
}