import type { Edge } from "../../estructuras/edge.js";
import type { Graph } from "../../estructuras/graph/graph.js";
import type { Vertex } from "../../estructuras/vertex.js";
import { toUndirectedAdjacency } from "../../estructuras/proyeccion/incidence_list.js";
import { COLOR } from "../../estructuras/vertex.js";

export class DSatur<T> {
    private colorMap: Map<string, COLOR | string> = new Map();
    private saturation: Map<string, Set<COLOR | string>> = new Map();
    private adjList: Map<string, Edge<T>[]>;
    private numColors: number = 0;
    private ran: boolean = false;

    private readonly availableColors: (COLOR | string)[];

    constructor(
        private graph: Graph<T>,
        customColors?: (COLOR | string)[]
    ) {
        this.adjList = toUndirectedAdjacency(graph);

        this.availableColors = (customColors && customColors.length > 0)
            ? [...customColors] // copia para no mutar el array original
            : [COLOR.RED, COLOR.GREEN, COLOR.BLUE, COLOR.YELLOW,
                COLOR.ORANGE, COLOR.PURPLE, COLOR.CYAN, COLOR.MAGENTA, COLOR.BLACK];

        this.run();
    }

    private run(): void {
        if (this.ran) return;
        this.ran = true;

        const vertices = this.graph.getVertex();
        if (vertices.length === 0) return;

        // Inicializar estructuras
        for (const vertex of vertices) {
            this.colorMap.set(vertex.id, COLOR.WHITE);
            this.saturation.set(vertex.id, new Set());
        }

        // Vértice con mayor grado → colorear primero
        let maxDegreeVertexId = vertices[0]!.id;
        let maxDegree = 0;
        for (const vertex of vertices) {
            const degree = this.adjList.get(vertex.id)?.length ?? 0;
            if (degree > maxDegree) {
                maxDegree = degree;
                maxDegreeVertexId = vertex.id;
            }
        }

        const firstColor = this.getColorByIndex(0);
        this.colorMap.set(maxDegreeVertexId, firstColor);
        this.numColors = 1;
        this.graph.getVertexById(maxDegreeVertexId).setColor(firstColor);
        this.updateSaturation(maxDegreeVertexId);

        // Colorear el resto
        while (this.hasUncoloredVertices()) {
            const vertexToColor = this.findVertexWithMaxSaturation(vertices);
            if (!vertexToColor) break;

            const color = this.findAvailableColor(vertexToColor);
            this.colorMap.set(vertexToColor, color);
            this.graph.getVertexById(vertexToColor).setColor(color);

            const colorIndex = this.getColorIndex(color);
            this.numColors = Math.max(this.numColors, colorIndex + 1);

            this.updateSaturation(vertexToColor);
        }
    }


    private getColorByIndex(index: number): COLOR | string {
        const color = this.availableColors[index];
        if (color === undefined) {
            throw new Error(
                `DSatur: no hay suficientes colores/salones disponibles (se necesita índice ${index} ` +
                `pero solo hay ${this.availableColors.length}). Agrega más salones al input.`
            );
        }
        return color;
    }

    private getColorIndex(color: COLOR | string): number {
        const index = this.availableColors.indexOf(color);
        return index !== -1 ? index : this.availableColors.length;
    }

    private hasUncoloredVertices(): boolean {
        for (const color of this.colorMap.values()) {
            if (color === COLOR.WHITE) return true;
        }
        return false;
    }

    private findVertexWithMaxSaturation(vertices: Vertex<T>[]): string | null {
        let maxSat    = -1;
        let maxDegree = -1;
        let selected: string | null = null;

        for (const vertex of vertices) {
            if (this.colorMap.get(vertex.id) !== COLOR.WHITE) continue;

            const sat    = this.saturation.get(vertex.id)?.size ?? 0;
            const degree = this.adjList.get(vertex.id)?.length ?? 0;

            if (sat > maxSat || (sat === maxSat && degree > maxDegree)) {
                maxSat    = sat;
                maxDegree = degree;
                selected  = vertex.id;
            }
        }

        return selected;
    }

    /**
     * Busca el primer color de availableColors que no usen los vecinos.
     * Si todos están ocupados, genera un CUSTOM_ y lo agrega a la lista
     * (esto indica que faltan salones — ScheduleSolver lo detectará y lanzará error).
     */
    private findAvailableColor(vertexId: string): COLOR | string {
        const usedByNeighbors = this.saturation.get(vertexId) ?? new Set();

        for (const color of this.availableColors) {
            if (!usedByNeighbors.has(color)) return color;
        }

        // Sin salones suficientes → CUSTOM_ para que ScheduleSolver lo detecte
        const newColor = `CUSTOM_${this.availableColors.length}`;
        (this.availableColors as (COLOR | string)[]).push(newColor);
        return newColor;
    }

    private updateSaturation(coloredVertex: string): void {
        const assignedColor = this.colorMap.get(coloredVertex);
        if (!assignedColor || assignedColor === COLOR.WHITE) return;

        const neighbors = this.adjList.get(coloredVertex) ?? [];
        for (const edge of neighbors) {
            const adjacentId = edge.from.id === coloredVertex ? edge.to.id : edge.from.id;
            if (this.colorMap.get(adjacentId) === COLOR.WHITE) {
                this.saturation.get(adjacentId)?.add(assignedColor);
            }
        }
    }

    // ─── API pública ──────────────────────────────────────────────────────────

    getVertexColor(vertexId: string): COLOR | string {
        return this.colorMap.get(vertexId) ?? COLOR.WHITE;
    }

    getColors(): Map<string, COLOR | string> {
        return new Map(this.colorMap);
    }

    getNumColors(): number {
        return this.numColors;
    }

    getVerticesByColor(): Map<COLOR | string, string[]> {
        const groups = new Map<COLOR | string, string[]>();
        for (const [vertexId, color] of this.colorMap) {
            if (!groups.has(color)) groups.set(color, []);
            groups.get(color)!.push(vertexId);
        }
        return groups;
    }

    isValid(): boolean {
        for (const edge of this.graph.getEdges()) {
            const c1 = this.colorMap.get(edge.from.id);
            const c2 = this.colorMap.get(edge.to.id);
            if (c1 && c2 && c1 === c2 && c1 !== COLOR.WHITE) return false;
        }
        return true;
    }

    toString(): string {
        let result = `D-Satur:\nColores usados: ${this.numColors}\nVálido: ${this.isValid() ? "Sí" : "No"}\n\n`;
        for (const [color, vertices] of this.getVerticesByColor()) {
            if (color !== COLOR.WHITE) result += `${color}: ${vertices.join(", ")}\n`;
        }
        return result;
    }
}