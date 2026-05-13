import type { Edge } from "../../../estructuras/edge.js";
import type { Graph } from "../../../estructuras/graph/graph.js";
import type { Vertex } from "../../../estructuras/vertex.js";
import { toUndirectedAdjacency } from "../../../estructuras/proyeccion/incidence_list.js";
import { COLOR } from "../../../estructuras/vertex.js";
import type {ColoredGraphAlgorithm} from "../coloreado.interface.js";

export class WelshPowell<T> implements ColoredGraphAlgorithm{
    private colorMap: Map<string, COLOR | string> = new Map();
    private adjList: Map<string, Edge<T>[]>;
    private numColors: number = 0;
    private ran: boolean = false;
    private readonly availableColors: (COLOR | string)[];

    constructor(
        private graph: Graph<T>,
        customColors?: (COLOR | string)[]
    ) {
        this.adjList = toUndirectedAdjacency(graph);

        if (customColors && customColors.length > 0) {
            this.availableColors = customColors;
        } else {
            this.availableColors = [
                COLOR.RED, COLOR.GREEN, COLOR.BLUE, COLOR.YELLOW,
                COLOR.ORANGE, COLOR.PURPLE, COLOR.CYAN, COLOR.MAGENTA,
                COLOR.BLACK
            ];
        }

        this.run();
    }

    private getColorByIndex(index: number): COLOR | string {
        const result = this.availableColors[index % this.availableColors.length];
        if (!result) throw new Error("No se puede encontrar color en el index");
        return result;
    }

    private getColorIndex(color: COLOR | string): number {
        const index = this.availableColors.indexOf(color);
        return index !== -1 ? index : this.availableColors.length;
    }

    private run(): void {
        if (this.ran) return;
        this.ran = true;

        const vertices = this.graph.getVertex();

        // Inicializar todos los vértices sin color
        for (const vertex of vertices) {
            this.colorMap.set(vertex.id, COLOR.WHITE);
        }

        // Ordenar vértices por grado descendente
        const sortedVertices = [...vertices].sort((a, b) => {
            const gradoA = this.adjList.get(a.id)?.length ?? 0;
            const gradoB = this.adjList.get(b.id)?.length ?? 0;
            return gradoB - gradoA;
        });

        // Colorear vértices ordenados
        for (const vertex of sortedVertices) {
            if (this.colorMap.get(vertex.id) === COLOR.WHITE) {
                // Encontrar color disponible
                const availableColor = this.findAvailableColor(vertex.id);
                this.colorMap.set(vertex.id, availableColor);
                vertex.setColor(availableColor);
                this.numColors = Math.max(this.numColors, this.getColorIndex(availableColor) + 1);

                // Intentar colorear vértices no adyacentes con el mismo color
                this.colorCompatibleVertices(vertex.id, availableColor, sortedVertices);
            }
        }
    }

    private findAvailableColor(vertexId: string): COLOR | string {
        const usedColors = new Set<COLOR | string>();
        const neighbors = this.adjList.get(vertexId) ?? [];

        for (const edge of neighbors) {
            const adjacentId = edge.from.id === vertexId ? edge.to.id : edge.from.id;
            const adjacentColor = this.colorMap.get(adjacentId);
            if (adjacentColor && adjacentColor !== COLOR.WHITE) {
                usedColors.add(adjacentColor);
            }
        }

        let colorIndex = 0;
        let availableColor = this.getColorByIndex(colorIndex);
        while (usedColors.has(availableColor)) {
            colorIndex++;
            availableColor = this.getColorByIndex(colorIndex);
        }
        return availableColor;
    }

    private colorCompatibleVertices(
        referenceVertexId: string,
        color: COLOR | string,
        vertexList: Vertex<T>[]
    ): void {
        for (const vertex of vertexList) {
            if (this.colorMap.get(vertex.id) === COLOR.WHITE) {
                // Verificar que no sea adyacente al vértice de referencia
                if (this.isNotAdjacent(vertex.id, referenceVertexId)) {
                    // Verificar que ningún vecino tenga este color
                    if (this.canUseColor(vertex.id, color)) {
                        this.colorMap.set(vertex.id, color);
                        vertex.setColor(color);
                    }
                }
            }
        }
    }

    private isNotAdjacent(vertexId: string, otherVertexId: string): boolean {
        const neighbors = this.adjList.get(vertexId) ?? [];
        for (const edge of neighbors) {
            const adjacentId = edge.from.id === vertexId ? edge.to.id : edge.from.id;
            if (adjacentId === otherVertexId) {
                return false;
            }
        }
        return true;
    }

    private canUseColor(vertexId: string, color: COLOR | string): boolean {
        const neighbors = this.adjList.get(vertexId) ?? [];
        for (const edge of neighbors) {
            const adjacentId = edge.from.id === vertexId ? edge.to.id : edge.from.id;
            const adjacentColor = this.colorMap.get(adjacentId);
            if (adjacentColor === color) {
                return false;
            }
        }
        return true;
    }

    getVertexColor(vertexId: string): COLOR | string {
        return this.colorMap.get(vertexId) ?? COLOR.WHITE;
    }

    getColors(): Map<string, COLOR | string> {
        return new Map(this.colorMap);
    }

    getNumColors(): number {
        return this.numColors;
    }

    getVertexByColor(): Map<COLOR | string, string[]> {
        const groups = new Map<COLOR | string, string[]>();

        for (const [vertexId, color] of this.colorMap) {
            if (color !== COLOR.WHITE) {
                if (!groups.has(color)) {
                    groups.set(color, []);
                }
                groups.get(color)!.push(vertexId);
            }
        }

        return groups;
    }

    isValid(): boolean {
        const edges = this.graph.getEdges();

        for (const edge of edges) {
            const color1 = this.colorMap.get(edge.from.id);
            const color2 = this.colorMap.get(edge.to.id);

            if (color1 === color2 && color1 !== COLOR.WHITE) {
                return false;
            }
        }

        return true;
    }

    toString(): string {
        let result = `Welsh-Powell:\n`;
        result += `Número de colores: ${this.numColors}\n`;
        result += `Válida: ${this.isValid() ? "Sí" : "No"}\n\n`;

        const byColor = this.getVertexByColor();
        for (const [color, vertices] of byColor) {
            result += `Color ${color}: ${vertices.join(", ")}\n`;
        }

        return result;
    }
}