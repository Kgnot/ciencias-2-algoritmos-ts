import type { Vertex, VertexID } from "../../../estructuras/vertex.js";
import { COLOR } from "../../../estructuras/vertex.js";
import { ColoredGraphAlgorithm } from "../coloreado.abstract.js";

export class WelshPowell<T> extends ColoredGraphAlgorithm<T> {


    constructor(graph: any, customColors?: (COLOR | string)[]) {
        super(graph, customColors);
        this.run();
    }

    protected run(): void {
        if (this.ran) return;
        this.ran = true;

        const vertices = this.graph.getVertex();

        // Ordenar por grado descendente
        const sorted = [...vertices].sort((a, b) => {
            const degA = this.adjList.get(a.id)?.length ?? 0;
            const degB = this.adjList.get(b.id)?.length ?? 0;
            return degB - degA;
        });

        for (const vertex of sorted) {
            if (this.colorMap.get(vertex.id) !== COLOR.WHITE) continue;

            const color = this.findAvailableColor(vertex.id);
            this.assignColor(vertex.id, color);

            this.colorCompatibleVertices(vertex.id, color, sorted);
        }
    }

    private assignColor(vertexId: VertexID, color: COLOR | string) {
        this.colorMap.set(vertexId, color);
        this.graph.getVertexById(vertexId).setColor(color);
        this.numColors = Math.max(this.numColors, this.getColorIndex(color) + 1);
    }

    private findAvailableColor(vertexId: VertexID   ): COLOR | string {
        const used = new Set<COLOR | string>();
        const neighbors = this.adjList.get(vertexId) ?? [];

        for (const edge of neighbors) {
            const adj = edge.from.id === vertexId ? edge.to.id : edge.from.id;
            const c = this.colorMap.get(adj);
            if (c && c !== COLOR.WHITE) used.add(c);
        }

        let i = 0;
        let color = this.getColorByIndex(i);

        while (used.has(color)) {
            i++;
            color = this.getColorByIndex(i);
        }

        return color;
    }

    private colorCompatibleVertices(
        refId: VertexID,
        color: COLOR | string,
        vertices: Vertex<T>[]
    ) {
        for (const v of vertices) {
            if (this.colorMap.get(v.id) !== COLOR.WHITE) continue;

            if (this.isNotAdjacent(v.id, refId) && this.canUseColor(v.id, color)) {
                this.assignColor(v.id, color);
            }
        }
    }

    private isNotAdjacent(v1: VertexID, v2: VertexID): boolean {
        const neighbors = this.adjList.get(v1) ?? [];
        for (const edge of neighbors) {
            const adj = edge.from.id === v1 ? edge.to.id : edge.from.id;
            if (adj === v2) return false;
        }
        return true;
    }

    private canUseColor(vertexId: VertexID, color: COLOR | string): boolean {
        const neighbors = this.adjList.get(vertexId) ?? [];

        for (const edge of neighbors) {
            const adj = edge.from.id === vertexId ? edge.to.id : edge.from.id;
            if (this.colorMap.get(adj) === color) return false;
        }

        return true;
    }
}