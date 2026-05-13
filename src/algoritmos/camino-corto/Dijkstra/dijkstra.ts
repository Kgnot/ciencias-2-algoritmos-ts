/*
 Dijkstra:
 Para dijkstra la mejor representacion es la lista de adyacencia, 
 ya que nos permite acceder a los vecinos de cada vertice de manera eficiente.
*/

import type { Edge } from "../../../estructuras/edge.js";
import type { Graph } from "../../../estructuras/graph/graph.js";
import { toAdjacencyList } from "../../../estructuras/proyeccion/adjacency_list.js";

export class Dijkstra<T> {
    private distances: Map<string, number>;
    private previous: Map<string, string | null>;
    private visited: Set<string>;
    private adjList: Map<string, Edge<T>[]>;
    private startId: string;

    constructor(graph: Graph<T>, startId: string) {
        // Convertir grafo a lista de adyacencia
        this.adjList = toAdjacencyList(graph);
        this.startId = startId;
        this.distances = new Map<string, number>();
        this.previous = new Map<string, string | null>();
        this.visited = new Set<string>();

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
        const queue: [string, number][] = [[this.startId, 0]];

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
    private runWithEarlyStop(targetId: string) {
        const queue: [string, number][] = [[this.startId, 0]];

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
    private buildPath(targetId: string): string[] {
        const path: string[] = [];
        let current: string | null = targetId;

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
    getDistance(toId: string): number {
        const distance = this.distances.get(toId);
        return distance !== undefined ? distance : Infinity;
    }

    // Obtener camino a un vértice específico
    getPath(toId: string): string[] {
        return this.buildPath(toId);
    }

    // Verificar si hay camino a un vértice
    hasPath(toId: string): boolean {
        return this.distances.get(toId) !== Infinity;
    }

    // Obtener todas las distancias
    getAllDistances(): Map<string, number> {
        return new Map(this.distances);
    }

    // Obtener el vértice anterior a cada uno
    getAllPrevious(): Map<string, string | null> {
        return new Map(this.previous);
    }

    // Versión con early stop (para optimizar cuando solo interesa un destino)
    static findPath<T>(
        graph: Graph<T>, 
        startId: string, 
        targetId: string
    ): { distance: number; path: string[] } {
        const dijkstra = new Dijkstra<T>(graph, startId);
        
        // Ejecutar con early stop
        dijkstra.runWithEarlyStop(targetId);
        
        return {
            distance: dijkstra.getDistance(targetId),
            path: dijkstra.getPath(targetId)
        };
    }
}