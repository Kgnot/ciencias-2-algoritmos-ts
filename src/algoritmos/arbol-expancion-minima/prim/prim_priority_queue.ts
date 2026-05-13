import type { Edge } from "../../../estructuras/edge.js";
import { PriorityQueue } from "../../../estructuras/utils/PriorityQueue.js";

export class PrimPriorityQueue<T> {
    private priorityQueue: PriorityQueue<Edge<T>> = new PriorityQueue();

    addEdge(edge: Edge<T>): void {
        this.priorityQueue.enqueue(edge);
    }

    addEdges(edges: Edge<T>[]): void {
        for (const edge of edges) {
            this.addEdge(edge);
        }
    }

    getNextEdge(): Edge<T> | undefined {
        return this.priorityQueue.dequeue();
    }

    isEmpty(): boolean {
        return this.priorityQueue.isEmpty();
    }
}
