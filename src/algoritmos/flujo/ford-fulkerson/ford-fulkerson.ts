import { DFS } from "../../dfs/dfs";
import type { Graph } from "../../../estructuras/graph/graph";
import type { Edge } from "../../../estructuras/edge";
import { GraphIndexer } from "../../../estructuras/graph/graph_indexer";
import { toAdjacencyMatrix } from "../../../estructuras/proyeccion/adjacency_matrix";
import type { VertexID } from "../../../estructuras/vertex";

export class FordFulkerson<T> {
    private dfs: DFS<T>;
    private readonly residualMatrix: number[][];
    private indexer: GraphIndexer<T>;

    constructor(private graph: Graph<T>) {
        this.dfs = new DFS(graph);
        const { matrix, indexer } = toAdjacencyMatrix(graph, true);
        this.residualMatrix = matrix;
        this.indexer = indexer;
    }

    private _getResidualCapacity(fromId: VertexID, toId: VertexID): number {
        const i = this.indexer.getIndex(fromId);
        const j = this.indexer.getIndex(toId);
        return this.residualMatrix[i]![j]!;
    }

    private _setResidualCapacity(fromId: VertexID, toId: VertexID, value: number): void {
        const i = this.indexer.getIndex(fromId);
        const j = this.indexer.getIndex(toId);
        this.residualMatrix[i]![j] = value;
    }

    public execute(sourceId: VertexID, sinkId: VertexID): number {
        let maxFlow = 0;

        const residualFilter = (edge: Edge<T>) =>
            this._getResidualCapacity(edge.from.id, edge.to.id) > 0;

        this.dfs.reset();
        this.dfs.execute(sourceId, residualFilter);
        let path = this.dfs.getPath(sourceId, sinkId);

        while (path.length > 0) {
            // bottleneck
            let pathFlow = Infinity;
            for (let i = 0; i < path.length - 1; i++) {
                const cap = this._getResidualCapacity(path[i]!, path[i + 1]!);
                pathFlow = Math.min(pathFlow, cap);
            }

            // actualizar matriz residual
            for (let i = 0; i < path.length - 1; i++) {
                const u = path[i]!;
                const v = path[i + 1]!;
                this._setResidualCapacity(u, v, this._getResidualCapacity(u, v) - pathFlow);
                this._setResidualCapacity(v, u, this._getResidualCapacity(v, u) + pathFlow);
            }

            maxFlow += pathFlow;

            this.dfs.reset();
            this.dfs.execute(sourceId, residualFilter);
            path = this.dfs.getPath(sourceId, sinkId);
        }

        return maxFlow;
    }
}