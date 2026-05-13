import type {Graph} from "../../estructuras/graph/graph.js";
import type {GrupoData} from "./models/grupo-data.model.js";
import {CLASSROOM_TYPE} from "./models/classroom.types.js";

export class GlobalContext {

    private static instance: GlobalContext | null = null;
    private graph: Graph<GrupoData> | null = null; // grafo de los grupos asociados a toda la universidad
    private subGraphs: Map<CLASSROOM_TYPE, Graph<GrupoData>> | null = null; // subgrafos por tipo de salon


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


}