import {Graph} from "../../../estructuras/graph/graph";
import type {GrupoData} from "../models/grupo-data.model";
import type {SalonInput} from "../models/input-base";
import {COLOR, Vertex, type VertexID} from "../../../estructuras/vertex";
import {Edge} from "../../../estructuras/edge";
import {GlobalContext} from "../global.context";
import {CLASSROOM_TYPE} from "../models/classroom.types";
import type {ColoredGraphAlgorithm} from "../../../algoritmos/coloreado/coloreado.abstract";
import {ConnectedComponents} from "../../../algoritmos/dfs/connected-components";

// Factory type: creates a fresh algorithm instance for a given (sub)graph and salon list.
// Using a factory avoids instanceof checks — the caller decides which algorithm to use.
export type AlgorithmFactory = (graph: Graph<GrupoData>, salones: string[]) => ColoredGraphAlgorithm<GrupoData>;


export class ScheduleSolver {

    private readonly globalContext: GlobalContext = GlobalContext.getInstance();

    constructor(
        private readonly graph: Graph<GrupoData>,
        private readonly salones: SalonInput[],
        private readonly algorithmFactory: AlgorithmFactory
    ) {
    }

    execute(): Map<VertexID, string> {
        const normalSalones = this.salones.filter(s => s.tipo === "normal").map(s => s.id);
        const labSalones = this.salones.filter(s => s.tipo === "laboratorio").map(s => s.id);

        const normalGraph = this.buildSubgraph(CLASSROOM_TYPE.NORMAL);
        const labGraph = this.buildSubgraph(CLASSROOM_TYPE.LABORATORIO);

        const colorMap = new Map<VertexID, string>();

        if (normalGraph.getVertex().length > 0) {
            const colors = this.colorear(normalGraph, normalSalones, CLASSROOM_TYPE.NORMAL);
            for (const [id, color] of colors) colorMap.set(id, color);
        }

        if (labGraph.getVertex().length > 0) {
            const colors = this.colorear(labGraph, labSalones, CLASSROOM_TYPE.LABORATORIO);
            for (const [id, color] of colors) colorMap.set(id, color);
        }

        const salonIds = new Set(this.salones.map(s => s.id));
        const colorDesconocido: string[] = [];
        for (const [vertexId, color] of colorMap) {
            if (!salonIds.has(color)) colorDesconocido.push(`${vertexId} → "${color}"`);
        }
        if (colorDesconocido.length > 0) {
            throw new Error(
                `Salones insuficientes. Los siguientes bloques no tienen salón real asignado:\n` +
                colorDesconocido.join("\n") +
                `\nAgrega más salones del tipo correspondiente al input.`
            );
        }

        this.globalContext.setGraph(this.graph);
        this.globalContext.setSubGraph(CLASSROOM_TYPE.NORMAL, normalGraph);
        this.globalContext.setSubGraph(CLASSROOM_TYPE.LABORATORIO, labGraph);
        this.globalContext.setColorMap(colorMap);

        return colorMap;
    }

    private buildSubgraph(tipo: CLASSROOM_TYPE): Graph<GrupoData> {
        const subgraph = new Graph<GrupoData>(false);
        const vertexMap = new Map<string, Vertex<GrupoData>>();

        for (const v of this.graph.getVertex()) {
            if (v.getValue().tipoSalon !== tipo) continue;
            const copy = new Vertex<GrupoData>(v.id, v.getValue());
            subgraph.addVertex(copy);
            vertexMap.set(copy.id, copy);
        }

        for (const e of this.graph.getUniqueEdges()) {
            const fromV = vertexMap.get(e.from.id);
            const toV = vertexMap.get(e.to.id);
            if (!fromV || !toV) continue;
            subgraph.addEdge(new Edge(fromV, toV, e.weight, e.directed, e.maxFlow));
        }

        return subgraph;
    }

    /**
     * Two-phase coloring pipeline:
     *
     * Phase 1 — BFS (ConnectedComponents): decomposes the conflict subgraph into
     * independent components. Blocks in different components have no conflict path
     * between them, so each component can be colored starting from classroom 1,
     * maximizing classroom reuse across non-conflicting parts of the schedule.
     *
     * Phase 2 — Graph Coloring (D-Satur / Welsh-Powell / Greedy): colors each
     * component independently with the chosen algorithm. Because components are
     * isolated, the coloring of one component never forces the next one to use
     * higher-numbered classrooms.
     */
    private colorear(
        graph: Graph<GrupoData>,
        salones: string[],
        tipo: CLASSROOM_TYPE
    ): Map<VertexID, string> {
        // Phase 1: BFS decomposition into connected components
        const components = new ConnectedComponents(graph);

        const result = new Map<VertexID, string>();

        // Phase 2: color each component independently
        for (const componentIds of components.getComponents()) {
            const componentGraph = this.buildComponentSubgraph(graph, componentIds);
            const componentColors = this.runAlgorithm(componentGraph, salones);

            for (const [id, color] of componentColors) {
                if (color !== COLOR.WHITE && color !== "WHITE") {
                    result.set(id, color as string);
                }
            }
        }

        // Propagate colors back to the original full graph and attach salon objects
        for (const [id, color] of result) {
            const originalVertex = this.graph.getVertexById(id);
            originalVertex.setColor(color);
            const data = originalVertex.getValue();
            const salon = this.salones.find(s => s.id === color);
            if (salon) data.salon = salon;
        }

        return result;
    }

    private buildComponentSubgraph(
        graph: Graph<GrupoData>,
        componentIds: VertexID[]
    ): Graph<GrupoData> {
        const idSet = new Set(componentIds.map(id => String(id)));
        const subgraph = new Graph<GrupoData>(false);
        const vertexMap = new Map<string, Vertex<GrupoData>>();

        for (const v of graph.getVertex()) {
            if (!idSet.has(v.id)) continue;
            const copy = new Vertex<GrupoData>(v.id, v.getValue());
            subgraph.addVertex(copy);
            vertexMap.set(copy.id, copy);
        }

        for (const e of graph.getUniqueEdges()) {
            const fromV = vertexMap.get(e.from.id);
            const toV = vertexMap.get(e.to.id);
            if (!fromV || !toV) continue;
            subgraph.addEdge(new Edge(fromV, toV, e.weight, e.directed, e.maxFlow));
        }

        return subgraph;
    }

    private runAlgorithm(
        componentGraph: Graph<GrupoData>,
        salones: string[]
    ): Map<VertexID, COLOR | string> {
        return this.algorithmFactory(componentGraph, salones).getColors();
    }
}
