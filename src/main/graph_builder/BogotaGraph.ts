import type { Graph } from "../../estructuras/graph/graph.js";
import type { NodeData } from "../entity/Data.js";

export interface BogotaGraph {
    graph: Graph<NodeData>;
    siteVertexIds: string[];   // IDs de los sitios turísticos en el grafo
    stopVertexIds: string[];   // IDs de las paradas GTFS en el grafo
}