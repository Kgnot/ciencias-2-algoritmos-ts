import type { Edge } from "../edge";
import type { Graph } from "../graph/graph";
import type { VertexID } from "../vertex";

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