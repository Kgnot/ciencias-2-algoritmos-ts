import {COLOR, type VertexID} from "../../estructuras/vertex.js";
import type {Graph} from "../../estructuras/graph/graph.js";
import type {Edge} from "../../estructuras/edge.js";
import {toIncidenceList, toUndirectedAdjacency} from "../../estructuras/proyeccion/incidence_list.js";

export abstract class ColoredGraphAlgorithm<T> {
    protected colorMap: Map<VertexID, COLOR | string> = new Map();
    protected numColors: number = 0;
    protected ran: boolean = false;

    protected readonly availableColors: (COLOR | string)[];
    protected readonly graph: Graph<T>;
    protected readonly adjList: Map<VertexID, Edge<T>[]>;

    protected constructor(
        graph: Graph<T>,
        customColors?: (COLOR | string)[]
    ) {
        this.graph = graph;
        this.adjList = toIncidenceList(graph);//toUndirectedAdjacency(graph);

        this.availableColors = (customColors && customColors.length > 0)
            ? customColors
            : [
                COLOR.RED, COLOR.GREEN, COLOR.BLUE, COLOR.YELLOW,
                COLOR.ORANGE, COLOR.PURPLE, COLOR.CYAN, COLOR.MAGENTA,
                COLOR.BLACK
            ];

        this.init();
    }

    // Template Method
    private init() {
        for (const v of this.graph.getVertex()) {
            this.colorMap.set(v.id, COLOR.WHITE);
        }
    }

    protected abstract run(): void;

    // Helpers comunes
    protected getColorByIndex(index: number): COLOR | string {
        const color = this.availableColors[index % this.availableColors.length];
        if (!color) throw new Error("Color inválido");
        return color;
    }

    protected getColorIndex(color: COLOR | string): number {
        const idx = this.availableColors.indexOf(color);
        return idx !== -1 ? idx : this.availableColors.length;
    }

    //  Implementación común

    getVertexColor(vertexId: VertexID): COLOR | string {
        return this.colorMap.get(vertexId) ?? COLOR.WHITE;
    }

    getColors(): Map<VertexID, COLOR | string> {
        return new Map(this.colorMap);
    }

    getNumColors(): number {
        return this.numColors;
    }

    getVertexByColor(): Map<COLOR | string, VertexID[]> {
        const groups = new Map<COLOR | string, VertexID[]>();

        for (const [v, c] of this.colorMap) {
            if (c === COLOR.WHITE) continue;
            if (!groups.has(c)) groups.set(c, []);
            groups.get(c)!.push(v);
        }

        return groups;
    }

    isValid(): boolean {
        for (const edge of this.graph.getEdges()) {
            const c1 = this.colorMap.get(edge.from.id);
            const c2 = this.colorMap.get(edge.to.id);
            if (c1 === c2 && c1 !== COLOR.WHITE) return false;
        }
        return true;
    }
}