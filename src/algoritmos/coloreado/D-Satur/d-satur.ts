import { COLOR, type VertexID } from "../../../estructuras/vertex.js";
import {ColoredGraphAlgorithm} from "../coloreado.abstract.js";

export class DSatur<T> extends ColoredGraphAlgorithm<T> {

    private saturation: Map<VertexID, Set<COLOR | string>> = new Map();

    constructor(graph: any, customColors?: (COLOR | string)[]) {
        super(graph, customColors);
        this.run();
    }

    protected run(): void {
        if (this.ran) return;
        this.ran = true;

        const vertices = this.graph.getVertex();
        if (vertices.length === 0) return;

        // Inicializar saturación
        for (const v of vertices) {
            this.saturation.set(v.id, new Set());
        }

        // Elegir vértice de mayor grado
        if (!vertices[0]) return;

        let start = vertices[0].id;
        let maxDegree = -1;

        for (const v of vertices) {
            const degree = this.adjList.get(v.id)?.length ?? 0;
            if (degree > maxDegree) {
                maxDegree = degree;
                start = v.id;
            }
        }

        this.assignColor(start, this.getColorByIndex(0));
        this.updateSaturation(start);

        while (this.hasUncolored()) {
            const v = this.selectVertex(vertices);
            if (!v) break;

            const color = this.findAvailableColor(v);
            this.assignColor(v, color);
            this.updateSaturation(v);
        }
    }

    private assignColor(vertexId: VertexID, color: COLOR | string) {
        this.colorMap.set(vertexId, color);
        this.graph.getVertexById(vertexId).setColor(color);
        this.numColors = Math.max(this.numColors, this.getColorIndex(color) + 1);
    }

    private hasUncolored(): boolean {
        for (const c of this.colorMap.values()) {
            if (c === COLOR.WHITE) return true;
        }
        return false;
    }

    private selectVertex(vertices: any[]): VertexID | null {
        let maxSat = -1;
        let maxDeg = -1;
        let selected: VertexID | null = null;

        for (const v of vertices) {
            if (this.colorMap.get(v.id) !== COLOR.WHITE) continue;

            const sat = this.saturation.get(v.id)?.size ?? 0;
            const deg = this.adjList.get(v.id)?.length ?? 0;

            if (sat > maxSat || (sat === maxSat && deg > maxDeg)) {
                maxSat = sat;
                maxDeg = deg;
                selected = v.id;
            }
        }

        return selected;
    }

    private findAvailableColor(vertexId: VertexID): COLOR | string {
        const used = this.saturation.get(vertexId) ?? new Set();

        for (const color of this.availableColors) {
            if (!used.has(color)) return color;
        }

        // fallback dinámico
        const newColor = `CUSTOM_${this.availableColors.length}`;
        (this.availableColors as (COLOR | string)[]).push(newColor);
        return newColor;
    }

    private updateSaturation(vertexId: VertexID) {
        const color = this.colorMap.get(vertexId);
        if (!color || color === COLOR.WHITE) return;

        const neighbors = this.adjList.get(vertexId) ?? [];

        for (const edge of neighbors) {
            const adj = edge.from.id === vertexId ? edge.to.id : edge.from.id;

            if (this.colorMap.get(adj) === COLOR.WHITE) {
                this.saturation.get(adj)?.add(color);
            }
        }
    }
}