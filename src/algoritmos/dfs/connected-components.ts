import type { Graph } from "../../estructuras/graph/graph";
import type { VertexID } from "../../estructuras/vertex";

/**
 * Decomposes an undirected graph into its connected components using BFS.
 *
 * In the classroom-assignment pipeline this runs BEFORE graph coloring.
 * Blocks in different components have no conflict path between them, so they
 * can be colored starting from color 1 each time — enabling classroom reuse
 * across non-conflicting parts of the schedule.
 *
 * Complexity: O(V + E)
 */
export class ConnectedComponents<T> {
    private readonly components: VertexID[][] = [];

    constructor(graph: Graph<T>) {
        this.run(graph);
    }

    private run(graph: Graph<T>): void {
        // Build adjacency list. Graph.addEdge stores both directions for
        // undirected edges, so iterating getEdges() gives all neighbors.
        const adj = new Map<string, string[]>();
        for (const v of graph.getVertex()) adj.set(v.id, []);
        for (const edge of graph.getEdges()) {
            adj.get(edge.from.id)?.push(edge.to.id);
        }

        const visited = new Set<string>();

        for (const vertex of graph.getVertex()) {
            if (visited.has(vertex.id)) continue;

            // BFS from this unvisited vertex — collects one component
            const component: VertexID[] = [];
            const queue: string[] = [vertex.id];
            visited.add(vertex.id);

            while (queue.length > 0) {
                const current = queue.shift()!;
                component.push(current);

                for (const neighbor of adj.get(current) ?? []) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                }
            }

            this.components.push(component);
        }
    }

    /** All components, each as an ordered list of vertex IDs. */
    getComponents(): VertexID[][] {
        return [...this.components];
    }

    /** Number of connected components found. */
    getCount(): number {
        return this.components.length;
    }

    /** Size of each component, sorted largest-first. */
    getSizes(): number[] {
        return this.components.map(c => c.length).sort((a, b) => b - a);
    }
}
