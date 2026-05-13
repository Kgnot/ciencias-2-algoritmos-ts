import {Graph} from "../../../estructuras/graph/graph.js";
import type {GrupoData} from "../models/grupo-data.model.js";
import type {SalonInput} from "../models/input-base.js";
import {Vertex} from "../../../estructuras/vertex.js";
import {Edge} from "../../../estructuras/edge.js";
import {GlobalContext} from "../global.context.js";
import {CLASSROOM_TYPE} from "../models/classroom.types.js";
import type {ColoredGraphAlgorithm} from "../../../algoritmos/coloreado/coloreado.interface.js";


export class ScheduleSolver {

    private readonly globalContext: GlobalContext = GlobalContext.getInstance();

    constructor(
        private readonly graph: Graph<GrupoData>,
        private readonly salones: SalonInput[],
        private readonly algorithm: ColoredGraphAlgorithm
    ) {
    }

    execute(): Map<string, string> {
        const normalSalones = this.salones.filter(s => s.tipo === "normal").map(s => s.id);
        const labSalones = this.salones.filter(s => s.tipo === "laboratorio").map(s => s.id);

        const normalGraph = this.buildSubgraph(CLASSROOM_TYPE.NORMAL);
        const labGraph = this.buildSubgraph(CLASSROOM_TYPE.LABORATORIO);

        const colorMap = new Map<string, string>();

        if (normalGraph.getVertex().length > 0) {
            const colors = this.colorear(normalGraph, normalSalones);
            for (const [id, color] of colors) colorMap.set(id, color);
        }

        if (labGraph.getVertex().length > 0) {
            const colors = this.colorear(labGraph, labSalones);
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
        // ahora rellenamos el contex global:
        this.globalContext.setGraph(this.graph);
        this.globalContext.setSubGraph(CLASSROOM_TYPE.NORMAL, normalGraph);
        this.globalContext.setSubGraph(CLASSROOM_TYPE.LABORATORIO, labGraph);
        // this.globalContext.setColorMap(colorMap);

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

    private colorear(
        graph: Graph<GrupoData>,
        salones: string[],
    ): Map<string, string> {
        let colorMap: Map<string, string | import("../../../estructuras/vertex.js").COLOR>; // esto sobra, creo yo

        colorMap = this.algorithm.getColors();

        const result = new Map<string, string>(); // este es verice id y color o salon en este caso
        for (const [id, color] of colorMap) {
            if (color !== "white" && color !== "WHITE") {
                result.set(id, color as string);
            }
        }
        return result;
    }
}