import type { Graph } from "../../estructuras/graph/graph.js";
import { GraphIndexer } from "../../estructuras/graph/graph_indexer.js";
import { toAdjacencyMatrix } from "../../estructuras/proyeccion/adjacency_matrix.js";
import { BFS } from "../dfs/bfs.js";

export class EdmonsKarp<T> {
	private residualMatrix: number[][];
	private indexer: GraphIndexer<T>;
	private bfs: BFS<T>;

	constructor(private graph: Graph<T>) {
		const { matrix, indexer } = toAdjacencyMatrix(graph, true);
		this.residualMatrix = matrix;
		this.indexer = indexer;
		this.bfs = new BFS(this.residualMatrix, this.indexer);
	}

	private getResidualCapacity(fromId: string, toId: string): number {
		const fromIndex = this.indexer.getIndex(fromId);
		const toIndex = this.indexer.getIndex(toId);
		return this.residualMatrix[fromIndex]![toIndex] ?? 0;
	}

	private setResidualCapacity(fromId: string, toId: string, value: number): void {
		const fromIndex = this.indexer.getIndex(fromId);
		const toIndex = this.indexer.getIndex(toId);
		this.residualMatrix[fromIndex]![toIndex] = value;
	}

	private buildPath(sourceId: string, sinkId: string, parent: number[]): string[] {
		return this.bfs.buildPath(sourceId, sinkId, parent);
	}

	private formatPath(path: string[]): string {
		return path.map((vertexId) => String(this.graph.getVertexById(vertexId).getValue())).join(" -> ");
	}

	public execute(sourceId: string, sinkId: string): number {
		const parent: number[] = Array(this.indexer.size()).fill(-1);
		let maxFlow = 0;

		while (this.bfs.search(sourceId, sinkId, parent)) {
			let pathFlow = Infinity;
			let currentId = sinkId;

			while (currentId !== sourceId) {
				const currentIndex = this.indexer.getIndex(currentId);
				const parentIndex = parent[currentIndex] ?? -1;

				if (parentIndex === -1) {
					pathFlow = 0;
					break;
				}

				const parentVertex = this.indexer.getVertex(parentIndex);
				pathFlow = Math.min(pathFlow, this.getResidualCapacity(parentVertex.id, currentId));
				currentId = parentVertex.id;
			}

			if (!Number.isFinite(pathFlow) || pathFlow <= 0) {
				break;
			}

			let vertexId = sinkId;
			while (vertexId !== sourceId) {
				const vertexIndex = this.indexer.getIndex(vertexId);
				const parentIndex = parent[vertexIndex] ?? -1;

				if (parentIndex === -1) {
					break;
				}

				const parentVertex = this.indexer.getVertex(parentIndex);
				this.setResidualCapacity(parentVertex.id, vertexId, this.getResidualCapacity(parentVertex.id, vertexId) - pathFlow);
				this.setResidualCapacity(vertexId, parentVertex.id, this.getResidualCapacity(vertexId, parentVertex.id) + pathFlow);
				vertexId = parentVertex.id;
			}

			maxFlow += pathFlow;

			const path = this.buildPath(sourceId, sinkId, parent);
			if (path.length > 0) {
				console.log(`Path: ${this.formatPath(path)}, Flow: ${pathFlow}`);
			}
		}

		return maxFlow;
	}
}