import type { Edge } from "../edge.js";
import type { Graph } from "../graph/graph.js";
import type { VertexID } from "../vertex.js";

export function toAdjacencyList<T>(graph: Graph<T>): Map<VertexID, Edge<T>[]> {
    const map = new Map<VertexID, Edge<T>[]>();

    for (const v of graph.getVertex()) {
        map.set(v.id, []);
    }
    for (const e of graph.getEdges()) {
        map.get(e.from.id)!.push(e);
    }
    return map;
}