import type { Graph } from "../graph/graph.js";
import { GraphIndexer } from "../graph/graph_indexer.js";

export function toAdjacencyMatrix<T>(graph: Graph<T>) {
    const vertices = graph.getVertex();
    const indexer = new GraphIndexer(vertices);

    const size = indexer.size();
    const matrix: number[][] = Array.from({ length: size }, () =>
        Array(size).fill(Infinity)
    );

    // diagonal en 0
    for (let i = 0; i < size; i++) {
        matrix[i]![i] = 0;
    }

    for (const edge of graph.getEdges()) {
        const i = indexer.getIndex(edge.from.id);
        const j = indexer.getIndex(edge.to.id);

        matrix[i]![j] = edge.weight;
    }

    return { matrix, indexer };
}