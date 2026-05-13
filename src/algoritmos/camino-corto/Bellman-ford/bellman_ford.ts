import type { Edge } from "../../../estructuras/edge.js";
import type { Graph } from "../../../estructuras/graph/graph.js";
import type { Vertex } from "../../../estructuras/vertex.js";

export class BellmanFord<T> {
    private distances: Map<string, number>;
    private previous: Map<string, string | null>;
    private vertices: Vertex<T>[];
    private edges: Edge<T>[];

    constructor(graph: Graph<T>, startId: string) {
        this.vertices = graph.getVertex();
        this.edges = graph.getEdges();
        this.distances = new Map<string, number>();
        this.previous = new Map<string, string | null>();

        this.initialize(startId);
        this.run();
        this.detectNegativeCycle();
    }

    // ------------------------
    // Inicialización
    // ------------------------
    private initialize(startId: string) {
        for (const v of this.vertices) {
            this.distances.set(v.id, Infinity);
            this.previous.set(v.id, null);
        }
        this.distances.set(startId, 0);
    }

    // ------------------------
    // Algoritmo principal
    // ------------------------
    private run() {
        const n = this.vertices.length;

        // Relajamos las aristas V-1 veces
        for (let i = 0; i < n - 1; i++) {
            let relaxed = false; // optimización: si no hay cambios, terminamos temprano
            
            for (const edge of this.edges) {
                const fromId = edge.from.id;
                const toId = edge.to.id;
                
                const distFrom = this.distances.get(fromId);
                
                // Saltamos si el origen no ha sido alcanzado todavía
                if (distFrom === Infinity) continue;
                
                const newDist = distFrom! + edge.weight;
                const currentDist = this.distances.get(toId)!;
                
                if (newDist < currentDist) {
                    this.distances.set(toId, newDist);
                    this.previous.set(toId, fromId);
                    relaxed = true;
                }
            }
            
            // Si no hubo relajaciones, terminamos temprano
            if (!relaxed) break;
        }
    }

    // ------------------------
    // Detección de ciclos negativos
    // ------------------------
    private detectNegativeCycle() {
        for (const edge of this.edges) {
            const fromId = edge.from.id;
            const toId = edge.to.id;
            
            const distFrom = this.distances.get(fromId);
            if (distFrom === Infinity) continue;
            
            if (distFrom! + edge.weight < this.distances.get(toId)!) {
                throw new Error("Negative weight cycle detected");
            }
        }
    }

    // ------------------------
    // API pública
    // ------------------------
    
    getDistance(toId: string): number {
        const distance = this.distances.get(toId);
        if (distance === undefined) return Infinity;
        return distance;
    }

    getPath(toId: string): string[] {
        const path: string[] = [];
        let current: string | null = toId;

        while (current !== null) {
            path.unshift(current);
            current = this.previous.get(current) ?? null;
        }

        return path;
    }

    getAllDistances(): Map<string, number> {
        return new Map(this.distances);
    }

    getPrevious(): Map<string, string | null> {
        return new Map(this.previous);
    }

    hasPath(toId: string): boolean {
        return this.distances.get(toId) !== Infinity;
    }
}