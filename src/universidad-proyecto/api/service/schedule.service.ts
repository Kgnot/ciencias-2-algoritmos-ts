import { performance } from "perf_hooks";
import { SchedulerDataLoader } from "../../data/scheduler-data-loader";
import { ConflictGraphBuilder } from "../../logic/schedule/conflict-graph/conflict-graph-builder";
import { ScheduleBuilder, type HorarioSemanal } from "../../logic/schedule/scheduler-builder";
import { DSatur } from "../../../algoritmos/coloreado/D-Satur/d-satur";
import { WelshPowell } from "../../../algoritmos/coloreado/Whelsh-Powell/whelsh-powell";
import { ColoreadorVoraz } from "../../../algoritmos/coloreado/coloreado-voraz/coloreado-voraz";
import { Graph } from "../../../estructuras/graph/graph";
import { Vertex } from "../../../estructuras/vertex";
import { Edge } from "../../../estructuras/edge";
import { GlobalContext } from "../../logic/global.context";
import { ConnectedComponents } from "../../../algoritmos/dfs/connected-components";
import type { GrupoData } from "../../logic/models/grupo-data.model";
import type { ScheduleInput } from "../../logic/models/input-base";

// ─── Graph visualization types ────────────────────────────────────────────────

export interface GraphNode {
    id: string;
    label: string;
    materia: string;
    grupo: string;
    bloque: number;
    semestre: number;
    carrera: string;
    salon: string;
    tipoSalon: string;
    franja: string;
    profesor: string;
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    tipo: "franja" | "grupo-dia" | "profesor";
}

export interface GraphStats {
    totalVertices: number;
    totalEdges: number;
    coloresUsados: number;
    salonesDisponibles: number;
    semestres: number[];
    carreras: string[];
    componentCount: number;
    componentSizes: number[];
    densidad: number;
}

export interface GraphDataResponse {
    nodes: GraphNode[];
    edges: GraphEdge[];
    stats: GraphStats;
}

export interface AlgorithmResult {
    nombre: string;
    descripcion: string;
    colores: number;
    valido: boolean;
    tiempoMs: number;
}

export interface AlgorithmComparisonResponse {
    resultados: AlgorithmResult[];
    grafo: { vertices: number; aristas: number; salonesDisponibles: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSubgraphs(input: ScheduleInput) {
    const { graph } = new ConflictGraphBuilder(input).build();
    const normalSalones = input.salones.filter(s => s.tipo === "normal").map(s => s.id);
    const labSalones    = input.salones.filter(s => s.tipo === "laboratorio").map(s => s.id);

    const normalGraph = new Graph<GrupoData>(false);
    const labGraph    = new Graph<GrupoData>(false);
    const normalMap   = new Map<string, Vertex<GrupoData>>();
    const labMap      = new Map<string, Vertex<GrupoData>>();

    for (const v of graph.getVertex()) {
        const copy = new Vertex<GrupoData>(v.id, v.getValue());
        if (v.getValue().tipoSalon === "laboratorio") {
            labGraph.addVertex(copy);
            labMap.set(copy.id, copy);
        } else {
            normalGraph.addVertex(copy);
            normalMap.set(copy.id, copy);
        }
    }

    for (const e of graph.getUniqueEdges()) {
        const fromType = e.from.getValue().tipoSalon;
        const toType   = e.to.getValue().tipoSalon;
        if (fromType !== toType) continue;
        if (fromType === "laboratorio") {
            const f = labMap.get(e.from.id);
            const t = labMap.get(e.to.id);
            if (f && t) labGraph.addEdge(new Edge(f, t, e.weight, e.directed, e.maxFlow));
        } else {
            const f = normalMap.get(e.from.id);
            const t = normalMap.get(e.to.id);
            if (f && t) normalGraph.addEdge(new Edge(f, t, e.weight, e.directed, e.maxFlow));
        }
    }

    return { normalGraph, labGraph, normalSalones, labSalones };
}

function edgeTipo(
    fromData: GrupoData,
    toData: GrupoData
): "franja" | "grupo-dia" | "profesor" {
    const sameFranja = fromData.franja && toData.franja &&
        fromData.franja.id === toData.franja.id;

    if (sameFranja) {
        if (fromData.profesor === toData.profesor) return "profesor";
        return "franja";
    }
    return "grupo-dia";
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class ScheduleService {

    private static instance: ScheduleService | null = null;
    private horarioGlobal: HorarioSemanal | null = null;
    private comparisonCache: AlgorithmComparisonResponse | null = null;

    private constructor() {}

    public static getInstance(): ScheduleService {
        if (!this.instance) {
            this.instance = new ScheduleService();
        }
        return this.instance;
    }

    async getHorarioGlobal(): Promise<HorarioSemanal> {
        if (this.horarioGlobal) return this.horarioGlobal;

        const input = SchedulerDataLoader.build().getData();
        const { graph } = new ConflictGraphBuilder(input).build();
        const algoritmo = new DSatur<GrupoData>(graph, input.salones.map(s => s.id));
        const horario = new ScheduleBuilder(graph, input.salones).buildHorario(algoritmo);

        this.horarioGlobal = horario;
        return horario;
    }

    async getGrafoInfo(): Promise<{ vertices: number; aristas: number }> {
        const { graph } = new ConflictGraphBuilder(SchedulerDataLoader.build().getData()).build();
        return {
            vertices: graph.getVertex().length,
            aristas: graph.getEdges().length
        };
    }

    getHorarioCache(): HorarioSemanal | null {
        return this.horarioGlobal;
    }

    // ── Graph visualization data ───────────────────────────────────────────────
    //
    // Returns ALL nodes and edges so the frontend can filter by semester/career.
    // Ensures the schedule has been solved first (setColor is called via execute()).

    async getGraphData(): Promise<GraphDataResponse> {
        await this.getHorarioGlobal();
        const graph = GlobalContext.getInstance().getGraph();

        const allVertices = graph.getVertex();
        const allEdges    = graph.getUniqueEdges();

        // Build node list
        const nodes: GraphNode[] = allVertices.map(v => {
            const d = v.getValue();
            const prefix = d.materiaId.includes('-')
                ? d.materiaId.split('-').slice(1).join('-')
                : d.materiaId;
            return {
                id:        v.id,
                label:     `${prefix} G${d.grupo}`,
                materia:   d.nombre,
                grupo:     d.grupo,
                bloque:    d.bloque,
                semestre:  d.semestre,
                carrera:   d.carrera,
                salon:     d.salon?.id ?? "Sin asignar",
                tipoSalon: d.tipoSalon,
                franja:    d.franja ? `${d.franja.dia} ${d.franja.inicio}-${d.franja.fin}` : "Sin franja",
                profesor:  d.profesor,
            };
        });

        // Build edge list (unique, undirected)
        const edges: GraphEdge[] = [];
        const seen = new Set<string>();
        for (const e of allEdges) {
            const key = [e.from.id, e.to.id].sort().join("|");
            if (seen.has(key)) continue;
            seen.add(key);
            edges.push({
                id:     `e-${e.from.id}-${e.to.id}`,
                source: e.from.id,
                target: e.to.id,
                tipo:   edgeTipo(e.from.getValue(), e.to.getValue())
            });
        }

        // Stats
        const salonesUsados = new Set(nodes.map(n => n.salon)).size;
        const salonesDisponibles = SchedulerDataLoader.build().getData().salones.length;
        const semestres  = [...new Set(nodes.map(n => n.semestre))].sort((a, b) => a - b);
        const carreras   = [...new Set(nodes.map(n => n.carrera))];
        const V = allVertices.length;
        const E = edges.length;
        const maxEdges = V * (V - 1) / 2;
        const densidad  = maxEdges > 0 ? Math.round((E / maxEdges) * 10000) / 100 : 0;

        const components = new ConnectedComponents(graph);

        return {
            nodes,
            edges,
            stats: {
                totalVertices:    V,
                totalEdges:       E,
                coloresUsados:    salonesUsados,
                salonesDisponibles,
                semestres,
                carreras,
                componentCount:   components.getCount(),
                componentSizes:   components.getSizes(),
                densidad,
            }
        };
    }

    // ── Algorithm comparison ──────────────────────────────────────────────────
    //
    // Runs all three coloring algorithms on fresh subgraphs and returns timing.
    // Result is cached after the first call.

    async getAlgorithmComparison(): Promise<AlgorithmComparisonResponse> {
        if (this.comparisonCache) return this.comparisonCache;

        const input = SchedulerDataLoader.build().getData();

        function runVoraz(): AlgorithmResult {
            const { normalGraph, labGraph, normalSalones, labSalones } = buildSubgraphs(input);
            const t0     = performance.now();
            const normal = new ColoreadorVoraz<GrupoData>(normalGraph, normalSalones);
            const lab    = new ColoreadorVoraz<GrupoData>(labGraph, labSalones);
            const nc     = normal.getColors(); const lc = lab.getColors();
            const nv     = normal.isValid();   const lv = lab.isValid();
            const timeMs = performance.now() - t0;
            return {
                nombre: "Greedy (Voraz)",
                descripcion: "Asigna el primer salón disponible según el orden de inserción de vértices. Es el algoritmo más rápido pero puede usar más salones.",
                colores: new Set([...nc.values(), ...lc.values()]).size,
                valido:  nv && lv,
                tiempoMs: Math.round(timeMs * 100) / 100,
            };
        }

        function runWelshPowell(): AlgorithmResult {
            const { normalGraph, labGraph, normalSalones, labSalones } = buildSubgraphs(input);
            const t0     = performance.now();
            const normal = new WelshPowell<GrupoData>(normalGraph, normalSalones);
            const lab    = new WelshPowell<GrupoData>(labGraph, labSalones);
            const nc     = normal.getColors(); const lc = lab.getColors();
            const nv     = normal.isValid();   const lv = lab.isValid();
            const timeMs = performance.now() - t0;
            return {
                nombre: "Welsh-Powell",
                descripcion: "Ordena los vértices por grado descendente antes de colorear. Tiende a usar menos colores que Voraz.",
                colores: new Set([...nc.values(), ...lc.values()]).size,
                valido:  nv && lv,
                tiempoMs: Math.round(timeMs * 100) / 100,
            };
        }

        function runDSatur(): AlgorithmResult {
            const { normalGraph, labGraph, normalSalones, labSalones } = buildSubgraphs(input);
            const t0     = performance.now();
            const normal = new DSatur<GrupoData>(normalGraph, normalSalones);
            const lab    = new DSatur<GrupoData>(labGraph, labSalones);
            const nc     = normal.getColors(); const lc = lab.getColors();
            const nv     = normal.isValid();   const lv = lab.isValid();
            const timeMs = performance.now() - t0;
            return {
                nombre: "D-Satur",
                descripcion: "Prioriza vértices con mayor número de colores distintos en sus vecinos (saturación). Produce coloraciones de alta calidad.",
                colores: new Set([...nc.values(), ...lc.values()]).size,
                valido:  nv && lv,
                tiempoMs: Math.round(timeMs * 100) / 100,
            };
        }

        const { graph } = new ConflictGraphBuilder(input).build();

        this.comparisonCache = {
            resultados: [runVoraz(), runWelshPowell(), runDSatur()],
            grafo: {
                vertices:          graph.getVertex().length,
                aristas:           graph.getUniqueEdges().length,
                salonesDisponibles: input.salones.length,
            }
        };

        return this.comparisonCache;
    }
}
