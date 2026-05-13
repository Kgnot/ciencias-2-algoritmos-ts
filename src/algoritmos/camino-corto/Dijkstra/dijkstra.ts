import type { Edge } from "../../../estructuras/edge.js";
import type { Graph } from "../../../estructuras/graph/graph.js";
import { toAdjacencyList } from "../../../estructuras/proyeccion/adjacency_list.js";
import type { VertexID } from "../../../estructuras/vertex.js";

export class Dijkstra<T> {
    private distances: Map<VertexID, number>;
    private previous: Map<VertexID, VertexID | null>;
    private visited: Set<VertexID>;
    private adjList: Map<VertexID, Edge<T>[]>;
    private startId: VertexID;

    constructor(graph: Graph<T>, startId: VertexID) {
        // Convertir grafo a lista de adyacencia
        this.adjList = toAdjacencyList(graph);
        this.startId = startId;
        this.distances = new Map<VertexID, number>();
        this.previous = new Map<VertexID, VertexID | null>();
        this.visited = new Set<VertexID>();

        this.initialize();
        this.run();
    }

    // ------------------------
    // Inicialización
    // ------------------------
    private initialize() {
        for (const vertex of this.adjList.keys()) {
            this.distances.set(vertex, Infinity);
            this.previous.set(vertex, null);
        }
        this.distances.set(this.startId, 0);
    }

    // ------------------------
    // Algoritmo principal
    // ------------------------
    private run() {
        // Cola de prioridad simulada con array de tuplas [vértice, distancia]
        const queue: [VertexID, number][] = [[this.startId, 0]];

        while (queue.length > 0) {
            // Ordenar para simular cola de prioridad (menor distancia primero)
            queue.sort((a, b) => a[1] - b[1]);
            const [current] = queue.shift()!;

            // Si ya visitamos este vértice, lo saltamos
            if (this.visited.has(current)) continue;
            
            // Marcamos como visitado
            this.visited.add(current);

            // Obtenemos los vecinos del vértice actual
            const neighbors = this.adjList.get(current) || [];
            
            for (const edge of neighbors) {
                const neighbor = edge.to.id;
                const newDist = this.distances.get(current)! + edge.weight;
                
                // Si encontramos una distancia mejor, actualizamos
                if (newDist < this.distances.get(neighbor)!) {
                    this.distances.set(neighbor, newDist);
                    this.previous.set(neighbor, current);
                    queue.push([neighbor, newDist]);
                }
            }
        }
    }

    // ------------------------
    // Con early stop (para un destino específico)
    // ------------------------
    private runWithEarlyStop(targetId: VertexID) {
        const queue: [VertexID, number][] = [[this.startId, 0]];

        while (queue.length > 0) {
            queue.sort((a, b) => a[1] - b[1]);
            const [current] = queue.shift()!;

            if (this.visited.has(current)) continue;
            this.visited.add(current);

            // Early stop: llegamos al destino
            if (current === targetId) break;

            const neighbors = this.adjList.get(current) || [];
            for (const edge of neighbors) {
                const neighbor = edge.to.id;
                const newDist = this.distances.get(current)! + edge.weight;
                
                if (newDist < this.distances.get(neighbor)!) {
                    this.distances.set(neighbor, newDist);
                    this.previous.set(neighbor, current);
                    queue.push([neighbor, newDist]);
                }
            }
        }
    }

    // ------------------------
    // Construcción de camino
    // ------------------------
    private buildPath(targetId: VertexID): VertexID[] {
        const path: VertexID[] = [];
        let current: VertexID | null = targetId;

        while (current !== null) {
            path.unshift(current);
            current = this.previous.get(current) ?? null;
        }

        // Si el primer elemento no es el start, no hay camino
        if (path[0] !== this.startId) return [];
        
        return path;
    }

    // ------------------------
    // API pública
    // ------------------------
    
    // Obtener distancia a un vértice específico
    getDistance(toId: VertexID): number {
        const distance = this.distances.get(toId);
        return distance !== undefined ? distance : Infinity;
    }

    // Obtener camino a un vértice específico
    getPath(toId: VertexID): VertexID[] {
        return this.buildPath(toId);
    }

    // Verificar si hay camino a un vértice
    hasPath(toId: VertexID): boolean {
        return this.distances.get(toId) !== Infinity;
    }

    // Obtener todas las distancias
    getAllDistances(): Map<VertexID, number> {
        return new Map(this.distances);
    }

    // Obtener el vértice anterior a cada uno
    getAllPrevious(): Map<VertexID, VertexID | null> {
        return new Map(this.previous);
    }

    // Versión con early stop (para optimizar cuando solo interesa un destino)
    static findPath<T>(
        graph: Graph<T>, 
        startId: VertexID, 
        targetId: VertexID
    ): { distance: number; path: VertexID[] } {
        const dijkstra = new Dijkstra<T>(graph, startId);
        
        // Ejecutar con early stop
        dijkstra.runWithEarlyStop(targetId);
        
        return {
            distance: dijkstra.getDistance(targetId),
            path: dijkstra.getPath(targetId)
        };
    }
}