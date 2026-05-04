import { DFS } from "../dfs/dfs.js";
import type { Graph } from "../../estructuras/graph/graph.js";
import type { Edge } from "../../estructuras/edge.js";

export class FordFulkerson<T> {
    private dfs: DFS<T>;

    constructor(private graph: Graph<T>) {
        this.dfs = new DFS(graph);
    }

    private _findEdge(fromId: string, toId: string): Edge<T> | undefined {
        console.log(`Finding edge from ${fromId} to ${toId}`);
        return this.graph.getEdges().find(
            e => e.from.id === fromId && e.to.id === toId
        );
    }

    public execute(sourceId: string, sinkId: string): number {
        let maxFlow = 0;
        // filtramos solo aristas con capacidad residual disponible
        const residualFilter = (edge: Edge<T>) =>
            edge.getMaxFlow() - edge.getFlowGiven() > 0;
        this.dfs.reset();
        this.dfs.execute(sourceId, residualFilter);
        let path = this.dfs.getPath(sourceId, sinkId); // obtenemos el camino
        while (path.length > 0) {
            // cuello de botella
            let pathFlow = Infinity;
            for (let i = 0; i < path.length-1; i++) {
                const edge = this._findEdge(path[i]!, path[i + 1]!);
                if (!edge) throw new Error(`Edge not found: ${path[i]} -> ${path[i + 1]}`);
                pathFlow = Math.min(pathFlow, edge.getMaxFlow() - edge.getFlowGiven());
            }
            //actualizamos los flujos
            for (let i = 0; i < path.length-1; i++) {
                const u = path[i]!;
                const v = path[i + 1]!;
                const forward = this._findEdge(u, v);
                //sumamos porque 
                if (forward) forward.setFlowGiven(forward.getFlowGiven() + pathFlow);
                const reverse = this._findEdge(v, u);
                if (reverse) reverse.setFlowGiven(reverse.getFlowGiven() + pathFlow);
            }
            maxFlow += pathFlow;
            //reseteamos y nuevo camino aumentante
            this.dfs.reset();
            this.dfs.execute(sourceId, residualFilter);
            path = this.dfs.getPath(sourceId, sinkId);
            console.log("PATH: ", path, "Flow: ", pathFlow);
        }
        return maxFlow;
    }
}