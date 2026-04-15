// Algoritmo de prim, 

import type { Edge } from "../../estructuras/edge.js";
import { Graph } from "../../estructuras/graph/graph.js";
import { toAdjacencyList } from "../../estructuras/proyeccion/adjacency_matrix.js";
import { PriorityQueue } from "../../estructuras/utils/PriorityQueue.js";
import type { Vertex } from "../../estructuras/vertex.js";

// en primer lugar, nosotros elegimos un nodo inicial aleatorio. 

export class PrimPriorityQueue {

    private priorityQueue: PriorityQueue<Edge<number>> = new PriorityQueue();

    addEdge(edge: Edge<number>): void {
        this.priorityQueue.enqueue(edge);
    }

    addEdges(edges: Edge<number>[]): void {
        for (const edge of edges) {
            this.addEdge(edge);
        }
    }

    getNextEdge(): Edge<number> {
        return this.priorityQueue.dequeue()!;
    }

    deleteEdge(edge: Edge<number>): void {

    }
}


function prim(graph: Graph<number>): Graph<number> {
    const primPriorityQueue = new PrimPriorityQueue();
    const listaAdyacencia = toAdjacencyList(graph);
    const visitados: Vertex<number>[] = [];
    // aleatorio
    const aleatorio = Math.floor(Math.random() * graph.vertexCount);
    const vertice = graph.getVertex()[aleatorio];
    if (!vertice) throw new Error("No se pudo seleccionar un vértice aleatorio");

    const edges = listaAdyacencia.get(vertice.id);
    if (!edges) throw new Error("No se encontraron aristas para el vértice seleccionado");
    primPriorityQueue.addEdges(edges!);
    const nextEdge = primPriorityQueue.getNextEdge();

    return {} as Graph<number>;
}