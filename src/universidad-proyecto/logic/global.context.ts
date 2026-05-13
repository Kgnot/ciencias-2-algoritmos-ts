import type {Graph} from "../../estructuras/graph/graph.js";
import type {GrupoData} from "./models/grupo-data.model.js";
import {CLASSROOM_TYPE} from "./models/classroom.types.js";
import {type VertexID} from "../../estructuras/vertex.js";

export class GlobalContext {

    private static instance: GlobalContext | null = null;
    private graph: Graph<GrupoData> | null = null; // grafo de los grupos asociados a toda la universidad
    private subGraphs: Map<CLASSROOM_TYPE, Graph<GrupoData>> | null = null; // subgrafos por tipo de salon
    // necesito el color map
    private colorMap: Map<VertexID, string> = new Map<VertexID, string>();


    private constructor() {
    }

    public static getInstance() {
        if (this.instance == null) {
            this.instance = new GlobalContext();
        }
        return this.instance;
    }

    public setSubGraph(type: CLASSROOM_TYPE, graph: Graph<GrupoData>) {
        if (this.subGraphs == null) {
            this.subGraphs = new Map<CLASSROOM_TYPE, Graph<GrupoData>>();
        }
        this.subGraphs.set(type, graph);

    }

    public setGraph(graph: Graph<GrupoData>) {
        this.graph = graph;
    }

    public setColorMap(map: Map<VertexID, string>) {
        this.colorMap = map;
    }

    public getGraph() {
        if (this.graph == null) {
            throw new Error("Graph not found");
        }
        return this.graph;
    }

    public getSubGraph(type: CLASSROOM_TYPE) {
        if (this.subGraphs == null) {
            throw new Error("subgraph not found");
        }
        return this.subGraphs.get(type);
    }

    public getColorMap() {
        if (this.colorMap == null) {
            throw new Error("colorMap not found");
        }
        return this.colorMap;
    }

}