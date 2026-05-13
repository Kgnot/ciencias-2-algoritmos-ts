import type { Vertex } from "../../../estructuras/vertex.js";
import { COLOR } from "../../../estructuras/vertex.js";
import { ColoredGraphAlgorithm } from "../coloreado.interface.js";

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
            const degA = this.adjList.get(a.id.value)?.length ?? 0;
            const degB = this.adjList.get(b.id.value)?.length ?? 0;
            return degB - degA;
        });

        for (const vertex of sorted) {
            if (this.colorMap.get(vertex.id.value) !== COLOR.WHITE) continue;

            const color = this.findAvailableColor(vertex.id.value);
            this.assignColor(vertex.id.value, color);

            this.colorCompatibleVertices(vertex.id.value, color, sorted);
        }
    }

    private assignColor(vertexId: string, color: COLOR | string) {
        this.colorMap.set(vertexId, color);
        this.graph.getVertexById(vertexId).setColor(color);
        this.numColors = Math.max(this.numColors, this.getColorIndex(color) + 1);
    }

    private findAvailableColor(vertexId: string): COLOR | string {
        const used = new Set<COLOR | string>();
        const neighbors = this.adjList.get(vertexId) ?? [];

        for (const edge of neighbors) {
            const adj = edge.from.id.value === vertexId ? edge.to.id.value : edge.from.id.value;
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
        refId: string,
        color: COLOR | string,
        vertices: Vertex<T>[]
    ) {
        for (const v of vertices) {
            if (this.colorMap.get(v.id.value) !== COLOR.WHITE) continue;

            if (this.isNotAdjacent(v.id.value, refId) && this.canUseColor(v.id.value, color)) {
                this.assignColor(v.id.value, color);
            }
        }
    }

    private isNotAdjacent(v1: string, v2: string): boolean {
        const neighbors = this.adjList.get(v1) ?? [];
        for (const edge of neighbors) {
            const adj = edge.from.id.value === v1 ? edge.to.id.value : edge.from.id.value;
            if (adj === v2) return false;
        }
        return true;
    }

    private canUseColor(vertexId: string, color: COLOR | string): boolean {
        const neighbors = this.adjList.get(vertexId) ?? [];

        for (const edge of neighbors) {
            const adj = edge.from.id.value === vertexId ? edge.to.id.value : edge.from.id.value;
            if (this.colorMap.get(adj) === color) return false;
        }

        return true;
    }
}