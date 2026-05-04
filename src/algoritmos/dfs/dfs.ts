import type { Graph } from "../../estructuras/graph/graph.js";
import type { Vertex } from "../../estructuras/vertex.js";
import type { Edge } from "../../estructuras/edge.js";
import { toAdjacencyList } from "../../estructuras/proyeccion/adjacency_list.js";

export class DFS<T> {

    private readonly visited: Set<string> = new Set();
    private adjacencyList: Map<string, Edge<T>[]>;
    private parent: Map<string, string | null> = new Map(); // representamos el padre de cada nodo (id) que puede ser nulo

    constructor(
        private graph: Graph<T>
    ) {
        this.adjacencyList = toAdjacencyList(graph);
    }

    // para ejecutar necesitamos un inicial, obligaremos a esto
    public execute(startVertexId: string, edgeFilter?: (edge: Edge<T>) => boolean): void {
        const vertices: Vertex<T>[] = this.graph.getVertex();
        // iniciamos todos los padres null
        for (const vertex of vertices) {
            this.parent.set(vertex.id, null);
        }
        const startVertex: Vertex<T> = this.graph.getVertexById(startVertexId);
        this._loop(startVertex, edgeFilter);
    }

    private _loop(vertex: Vertex<T>, edgeFilter?: (edge: Edge<T>) => boolean) {
        // marcamos el vértice como visitado:
        this.visited.add(vertex.id);
        //obtenemos los vertices adyacentes
        const adjacentEdges = this.adjacencyList.get(vertex.id) || [];
        // e iteramos xd
        for (const edge of adjacentEdges) {
            const allowed = edgeFilter ? edgeFilter(edge) : true;
            if (!this.visited.has(edge.to.id) && allowed) {
                this.parent.set(edge.to.id, vertex.id); // establecemos el padre del nodo adyacente
                console.log(this.parent.get(edge.to.id), "->", edge.to.id);
                this._loop(edge.to, edgeFilter); // y seguimos con el nodo adyacente
            }
        }
    }

    public getPath(fromId: string, toId: string): string[] {
        if (!this.visited.has(toId)) {
            return []; // el destino no fue visitado
        }
        const path: string[] = [];
        let current: string | null = toId;
        // y vamos a recontruir  el camino desde el destino al inicio:
        while (current) {
            path.unshift(current); // agregamos al inicio
            current = this.parent.get(current) || null;
        }
        //verificamos si el camino camienza desde el nodo inicial
        if (path[0] === fromId) {
            return path;
        }
        return []; // no hay camino directo
    }

    // obtener el parentMap:
    public getParentMap(): Map<string, string | null> {
        return new Map(this.parent);
    }

    // y como árbol:
    public getDFSTree(): { [key: string]: string } {
        const tree: { [key: string]: string } = {};
        for (const [child, parent] of this.parent.entries()) {
            if (parent !== null) {
                tree[child] = parent;
            } else {
                tree[child] = "raíz"; // Nodos raíz del árbol DFS
            }
        }
        return tree;
    }

    public reset(): void {
        this.visited.clear();
        this.parent.clear();
        this.adjacencyList = toAdjacencyList(this.graph); // reconstruimos la lista de adyacencia por si el grafo cambió
        console.log("DFS reset: visited cleared, parent map cleared, adjacency list rebuilt.");
    }

    public getVisited(): string[] {
        return Array.from(this.visited);
    }

}