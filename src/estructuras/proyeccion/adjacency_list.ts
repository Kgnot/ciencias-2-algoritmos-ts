import type { Edge } from "../edge.js";
import type { Graph } from "../graph/graph.js";

export function toAdjacencyList<T>(graph: Graph<T>): Map<string, Edge<T>[]> {
    const map = new Map<string, Edge<T>[]>();

    for (const v of graph.getVertex()) {
        map.set(v.id.value, []);
    }
    for (const e of graph.getEdges()) {
        map.get(e.from.id.value)!.push(e);
    }
    return map;
}