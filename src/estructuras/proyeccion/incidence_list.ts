import { Edge } from "../edge.js";
import type { Graph } from "../graph/graph.js";
import type { VertexID } from "../vertex.js";
import { toAdjacencyList } from "./adjacency_list.js";

export function toIncidenceList<T>(graph: Graph<T>) {
    const map = new Map<VertexID, Edge<T>[]>();

    for (const v of graph.getVertex()) {
        map.set(v.id, []);
    }

    for (const edge of graph.getEdges()) {
        map.get(edge.from.id)!.push(edge);
        map.get(edge.to.id)!.push(edge);
    }

    return map;
}

export function toUndirectedAdjacency<T>(graph: Graph<T>): Map<VertexID, Edge<T>[]> {
    const baseAdjacency = toAdjacencyList(graph);
    const normalized = new Map<VertexID, Edge<T>[]>();

    for (const v of graph.getVertex()) {
        normalized.set(v.id, []);
    }

    for (const e of graph.getUniqueEdges()) {
        normalized.get(e.from.id)?.push(e);
        normalized.get(e.to.id)?.push(
            new Edge(e.to, e.from, e.weight, false, e.maxFlow)
        );
    }

    // En caso de grafos dirigidos, preserva las salidas que ya existan en la lista estable.
    if (graph.directed) {
        for (const [id, edges] of baseAdjacency.entries()) {
            for (const edge of edges) {
                normalized.get(id)?.push(edge);
            }
        }
    }

    return normalized;
}