import {Graph} from "../../../estructuras/graph/graph";
import type {GrupoData} from "../models/grupo-data.model";
import type {SalonInput} from "../models/input-base";
import {COLOR, Vertex, type VertexID} from "../../../estructuras/vertex";
import {Edge} from "../../../estructuras/edge";
import {GlobalContext} from "../global.context";
import {CLASSROOM_TYPE} from "../models/classroom.types";
import {DSatur} from "../../../algoritmos/coloreado/D-Satur/d-satur";
import {WelshPowell} from "../../../algoritmos/coloreado/Whelsh-Powell/whelsh-powell";
import {ColoreadorVoraz} from "../../../algoritmos/coloreado/coloreado-voraz/coloreado-voraz";
import type {ColoredGraphAlgorithm} from "../../../algoritmos/coloreado/coloreado.abstract";


export class ScheduleSolver {

    private readonly globalContext: GlobalContext = GlobalContext.getInstance();

    constructor(
        private readonly graph: Graph<GrupoData>,
        private readonly salones: SalonInput[],
        private readonly algorithm: ColoredGraphAlgorithm<GrupoData>
    ) {
    }

    execute(): Map<VertexID, string> {
        const normalSalones = this.salones.filter(s => s.tipo === "normal").map(s => s.id);
        const labSalones = this.salones.filter(s => s.tipo === "laboratorio").map(s => s.id);

        const normalGraph = this.buildSubgraph(CLASSROOM_TYPE.NORMAL);
        const labGraph = this.buildSubgraph(CLASSROOM_TYPE.LABORATORIO);

        const colorMap = new Map<VertexID, string>();

        if (normalGraph.getVertex().length > 0) {
            const colors = this.colorear(normalGraph, normalSalones,CLASSROOM_TYPE.NORMAL);
            for (const [id, color] of colors) colorMap.set(id, color);
        }

        if (labGraph.getVertex().length > 0) {
            const colors = this.colorear(labGraph, labSalones,CLASSROOM_TYPE.LABORATORIO);
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
        console.log("grafo: ", this.graph.getVertexById("SIS-MAT1-G1-B0"));
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

    private colorear(
        graph: Graph<GrupoData>,
        salones: string[],
        tipo: CLASSROOM_TYPE
    ): Map<VertexID, string> {
        let algorithmInstance: ColoredGraphAlgorithm<GrupoData>;

        // Detectar el tipo de algoritmo usando instanceof
        if (this.algorithm instanceof DSatur) {
            algorithmInstance = new DSatur(graph, salones);
        } else if (this.algorithm instanceof WelshPowell) {
            algorithmInstance = new WelshPowell(graph, salones);
        } else if (this.algorithm instanceof ColoreadorVoraz) {
            algorithmInstance = new ColoreadorVoraz(graph, salones);
        } else {
            algorithmInstance = new DSatur(graph, salones);
        }

        const colorMap: Map<VertexID, COLOR | string> = algorithmInstance.getColors();
        const result = new Map<VertexID, string>();

        for (const [id, color] of colorMap) {
            if (color !== "white" && color !== "WHITE") {
                result.set(id, color as string);
        // TODO, si hay error es aqui xd
                // propagamos al grafo original
                const originalVertex = this.graph.getVertexById(id);
                // if (originalVertex.getValue().tipoSalon !== tipo) continue;
                originalVertex.setColor(color);

                // También puedes guardar el salón en los datos
                const data = originalVertex.getValue();
                const salon = this.salones.find(s => s.id === color);
                if (salon) {
                    data.salon = salon;
                }
            }
        }
        console.log("[RESULTADO] coloreado de grafos : " + result.get("SIS-CAL1-G1-B0"));

        return result;
    }
}