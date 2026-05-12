import { Graph } from "../../estructuras/graph/graph.js";
import type { GrupoData } from "../models/grupo-data.model.js";
import type { SalonInput } from "../models/input-base.js";
import { Vertex } from "../../estructuras/vertex.js";
import { Edge } from "../../estructuras/edge.js";
import { DSatur } from "../../algoritmos/D-Satur/d-satur.js";
import { WelshPowell } from "../../algoritmos/Whelsh-Powell/whelsh-powell.js";
import { ColoreadorVoraz } from "../../algoritmos/coloreado-voraz/coloreado-voraz.js";

export type AlgoritmoColoreado = "d-satur" | "welsh-powell" | "voraz";

export class ScheduleSolver {

    constructor(
        private readonly graph: Graph<GrupoData>,
        private readonly salones: SalonInput[],
    ) {}

    execute(algoritmo: AlgoritmoColoreado = "d-satur"): Map<string, string> {
        const normalSalones = this.salones.filter(s => s.tipo === "normal").map(s => s.id);
        const labSalones = this.salones.filter(s => s.tipo === "laboratorio").map(s => s.id);

        const normalGraph = this.buildSubgraph("normal");
        const labGraph = this.buildSubgraph("laboratorio");

        const colorMap = new Map<string, string>();

        if (normalGraph.getVertex().length > 0) {
            const colors = this.colorear(normalGraph, normalSalones, algoritmo);
            for (const [id, color] of colors) colorMap.set(id, color);
        }

        if (labGraph.getVertex().length > 0) {
            const colors = this.colorear(labGraph, labSalones, algoritmo);
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

        return colorMap;
    }

    private buildSubgraph(tipo: "normal" | "laboratorio"): Graph<GrupoData> {
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
        algoritmo: AlgoritmoColoreado,
    ): Map<string, string> {
        let colorMap: Map<string, string | import("../../estructuras/vertex.js").COLOR>;

        switch (algoritmo) {
            case "d-satur":
                colorMap = new DSatur(graph, salones).getColors();
                break;
            case "welsh-powell":
                colorMap = new WelshPowell(graph, salones).getColors();
                break;
            case "voraz":
                colorMap = new ColoreadorVoraz(graph, salones).getColors();
                break;
        }

        const result = new Map<string, string>();
        for (const [id, color] of colorMap) {
            if (color !== "white" && color !== "WHITE") {
                result.set(id, color as string);
            }
        }
        return result;
    }
}