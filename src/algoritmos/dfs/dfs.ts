import type { Graph } from "../../estructuras/graph/graph";
import type { Vertex, VertexID } from "../../estructuras/vertex";
import type { Edge } from "../../estructuras/edge";
import { toAdjacencyList } from "../../estructuras/proyeccion/adjacency_list";

export class DFS<T> {

    private readonly visited: Set<VertexID> = new Set();
    private adjacencyList: Map<VertexID, Edge<T>[]>;
    private parent: Map<VertexID, VertexID | null> = new Map(); // representamos el padre de cada nodo (id) que puede ser nulo

    constructor(
        private graph: Graph<T>
    ) {
        this.adjacencyList = toAdjacencyList(graph);
    }

    // para ejecutar necesitamos un inicial, obligaremos a esto
    public execute(startVertexId: VertexID, edgeFilter?: (edge: Edge<T>) => boolean): void {
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

    public getPath(fromId: VertexID, toId: VertexID): VertexID[] {
        if (!this.visited.has(toId)) {
            return []; // el destino no fue visitado
        }
        const path: VertexID[] = [];
        let current: VertexID | null = toId;
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
    public getParentMap(): Map<VertexID, VertexID | null> {
        return new Map(this.parent);
    }

    // y como árbol:
    public getDFSTree(): Record<string, string> {
        const tree: Record<string, string> = {};

        for (const [child, parent] of this.parent.entries()) {
            tree[child] = parent ? parent : "raíz";
        }

        return tree;
    }

    public reset(): void {
        this.visited.clear();
        this.parent.clear();
        this.adjacencyList = toAdjacencyList(this.graph); // reconstruimos la lista de adyacencia por si el grafo cambió
        console.log("DFS reset: visited cleared, parent map cleared, adjacency list rebuilt.");
    }

    public getVisited(): VertexID[] {
        return Array.from(this.visited);
    }

    public setAdjacencyList(map: Map<VertexID, Edge<T>[]>): void {
        this.adjacencyList = map;
    }

}