import { Graph } from "../graph/graph.js";
import { GraphIndexer } from "../graph/graph_indexer.js";

export function toIncidenceMatrix<T>(graph: Graph<T>) {
    const vertices = graph.getVertex();
    const edges = graph.getEdges();

    const indexer = new GraphIndexer(vertices);

    const matrix: number[][] = Array.from(
        { length: vertices.length },
        () => Array(edges.length).fill(0)
    );

    edges.forEach((edge, idx) => {
        // obtemoes los indices de los vertices de origen y destino
        const from: number = indexer.getIndex(edge.from.id.value);
        const to: number = indexer.getIndex(edge.to.id.value);

        if (graph.directed) {
            matrix[from]![idx] = -edge.weight; // salida
            matrix[to]![idx] = edge.weight; // entrada
        } else {
            matrix[from]![idx] = edge.weight; // incidencia
            matrix[to]![idx] = edge.weight; // incidencia
        }
    }
    );
    return { matrix, indexer };
}