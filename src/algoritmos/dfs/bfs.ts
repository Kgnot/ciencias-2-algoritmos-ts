import { GraphIndexer } from "../../estructuras/graph/graph_indexer.js";

export class BFS<T> {
	constructor(
		private residualMatrix: number[][],
		private indexer: GraphIndexer<T>,
	) {}

	public search(sourceId: string, sinkId: string, parent: number[]): boolean {
		const size = this.indexer.size();
		const visited = Array(size).fill(false);
		const queue: number[] = [];
		const sourceIndex = this.indexer.getIndex(sourceId);
		const sinkIndex = this.indexer.getIndex(sinkId);

		parent.fill(-1);
		queue.push(sourceIndex);
		visited[sourceIndex] = true;

		while (queue.length > 0) {
			const currentIndex = queue.shift();
			if (currentIndex === undefined) {
				continue;
			}

			const currentRow = this.residualMatrix[currentIndex];
			if (!currentRow) {
				continue;
			}

			for (let nextIndex = 0; nextIndex < size; nextIndex++) {
				const hasResidualCapacity = (currentRow[nextIndex] ?? 0) > 0;
				if (!visited[nextIndex] && hasResidualCapacity) {
					queue.push(nextIndex);
					visited[nextIndex] = true;
					parent[nextIndex] = currentIndex;
				}
			}
		}

		return visited[sinkIndex] ?? false;
	}

	public buildPath(sourceId: string, sinkId: string, parent: number[]): string[] {
		const path: string[] = [];
		const sourceIndex = this.indexer.getIndex(sourceId);
		let currentIndex = this.indexer.getIndex(sinkId);

		while (currentIndex !== sourceIndex) {
			const vertex = this.indexer.getVertex(currentIndex);
			path.push(vertex.id.value);

			currentIndex = parent[currentIndex] ?? -1;
			if (currentIndex === -1) {
				return [];
			}
		}

		path.push(sourceId);
		path.reverse();
		return path;
	}
}