import type {Edge} from "../../../estructuras/edge.js";
import type {Graph} from "../../../estructuras/graph/graph.js";
import {toUndirectedAdjacency} from "../../../estructuras/proyeccion/incidence_list.js";
import {COLOR} from "../../../estructuras/vertex.js";
import type {ColoredGraphAlgorithm} from "../coloreado.interface.js";

export class ColoreadorVoraz<T> implements ColoredGraphAlgorithm {
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

        // Inicializar todos los vértices sin color (COLOR.WHITE)
        for (const vertex of vertices) {
            this.colorMap.set(vertex.id, COLOR.WHITE);
        }

        // Colorear cada vértice en orden de aparición
        for (const vertex of vertices) {
            if (this.colorMap.get(vertex.id) === COLOR.WHITE) {
                // Encontrar colores usados por vecinos
                const usedColors = new Set<COLOR | string>();
                const neighbors = this.adjList.get(vertex.id) ?? [];

                for (const edge of neighbors) {
                    const adjacentId = edge.from.id === vertex.id ? edge.to.id : edge.from.id;
                    const adjacentColor = this.colorMap.get(adjacentId);
                    if (adjacentColor && adjacentColor !== COLOR.WHITE) {
                        usedColors.add(adjacentColor);
                    }
                }

                // Encontrar primer color disponible
                let colorIndex = 0;
                let availableColor = this.getColorByIndex(colorIndex);
                while (usedColors.has(availableColor)) {
                    colorIndex++;
                    availableColor = this.getColorByIndex(colorIndex);
                }

                // Asignar color
                this.colorMap.set(vertex.id, availableColor);
                vertex.setColor(availableColor);
                this.numColors = Math.max(this.numColors, this.getColorIndex(availableColor) + 1);
            }
        }
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
        let result = `Coloración Voraz:\n`;
        result += `Número de colores: ${this.numColors}\n`;
        result += `Válida: ${this.isValid() ? "Sí" : "No"}\n\n`;

        const byColor = this.getVertexByColor();
        for (const [color, vertices] of byColor) {
            result += `Color ${color}: ${vertices.join(", ")}\n`;
        }

        return result;
    }
}