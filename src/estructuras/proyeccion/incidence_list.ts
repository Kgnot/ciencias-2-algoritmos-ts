import type { Edge } from "../edge.js";
import type { Graph } from "../graph/graph.js";

export function toIncidenceList<T>(graph: Graph<T>) {
    const map = new Map<string, Edge<T>[]>();

    for (const v of graph.getVertex()) {
        map.set(v.id, []);
    }

    for (const edge of graph.getEdges()) {
        map.get(edge.from.id)!.push(edge);
        map.get(edge.to.id)!.push(edge);
    }

    return map;
}