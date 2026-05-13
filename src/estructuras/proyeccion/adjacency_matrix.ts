import type { Graph } from "../graph/graph.js";
import { GraphIndexer } from "../graph/graph_indexer.js";

export function toAdjacencyMatrix<T>(graph: Graph<T>, useFlow: boolean): { matrix: number[][]; indexer: GraphIndexer<T> } {
    const vertices = graph.getVertex();
    const indexer = new GraphIndexer(vertices);

    const size = indexer.size();
    const matrix: number[][] = Array.from({ length: size }, () =>
        Array(size).fill(0)
    );

    // diagonal en 0
    for (let i = 0; i < size; i++) {
        matrix[i]![i] = 0;
    }

    for (const edge of graph.getEdges()) {
        const i = indexer.getIndex(edge.from.id.value);
        const j = indexer.getIndex(edge.to.id.value);

        matrix[i]![j] = useFlow ? edge.getMaxFlow() : edge.weight;
    }

    return { matrix, indexer };
}