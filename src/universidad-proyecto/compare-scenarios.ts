import { performance } from "perf_hooks";
import rawData1 from "./data/data.json";
import rawData2 from "./data/data2.json";
import rawData3 from "./data/data3.json";
import type { ScheduleInput, MateriaInput, SalonInput } from "./logic/models/input-base";
import { ConflictGraphBuilder } from "./logic/schedule/conflict-graph/conflict-graph-builder";
import { Graph } from "../estructuras/graph/graph";
import { Vertex } from "../estructuras/vertex";
import { Edge } from "../estructuras/edge";
import type { GrupoData } from "./logic/models/grupo-data.model";
import { DSatur } from "../algoritmos/coloreado/D-Satur/d-satur";
import { WelshPowell } from "../algoritmos/coloreado/Whelsh-Powell/whelsh-powell";
import { ColoreadorVoraz } from "../algoritmos/coloreado/coloreado-voraz/coloreado-voraz";

// ─── Scenario definitions ──────────────────────────────────────────────────────

const scenarios: Array<{ label: string; desc: string; input: ScheduleInput }> = [
    {
        label: "Escenario 1 — Full Scale    (data.json)",
        desc:  "35 materias · 33 salones (23N+10L) · 8 franjas/día · 3 carreras, 2 semestres",
        input: {
            materias: rawData1.materias as MateriaInput[],
            salones:  rawData1.salones  as SalonInput[],
            franjas:  rawData1.franjas
        }
    },
    {
        label: "Escenario 2 — Reproducibilidad (data2.json)",
        desc:  "35 materias · 33 salones (23N+10L) · 8 franjas/día · validación de consistencia",
        input: {
            materias: rawData2.materias as MateriaInput[],
            salones:  rawData2.salones  as SalonInput[],
            franjas:  rawData2.franjas
        }
    },
    {
        label: "Escenario 3 — Prueba Estrés (data3.json)",
        desc:  "12 materias · 11 salones (8N+3L)  · 6 franjas/día · 1 carrera, profesores compartidos",
        input: {
            materias: rawData3.materias as MateriaInput[],
            salones:  rawData3.salones  as SalonInput[],
            franjas:  rawData3.franjas
        }
    }
];

// ─── Scenario metrics ─────────────────────────────────────────────────────────

interface ScenarioMetrics {
    V: number;
    E: number;
    totalSalones: number;
    baselineConflicts: number;
}

/**
 * Computes structural metrics for a scenario:
 *
 * - V / E: tamaño del grafo de conflictos.
 * - baselineConflicts: cuántas aristas de conflicto permanecen activas cuando los
 *   bloques se asignan de forma naive mediante round-robin (salón[i % total], sin
 *   verificar restricciones). Este es el "antes" de aplicar coloreo; después del
 *   coloreo válido, los conflictos = 0.
 */
function computeScenarioMetrics(input: ScheduleInput): ScenarioMetrics {
    const { graph } = new ConflictGraphBuilder(input).build();
    const vertices  = graph.getVertex();
    const edges     = graph.getUniqueEdges();

    const normalSalones = input.salones.filter(s => s.tipo === "normal").map(s => s.id);
    const labSalones    = input.salones.filter(s => s.tipo === "laboratorio").map(s => s.id);

    // Asignación naive round-robin: ignora todas las restricciones de conflicto.
    const assignment = new Map<string, string>();
    let ni = 0, li = 0;
    for (const v of vertices) {
        const tipo = v.getValue().tipoSalon;
        if (tipo === "laboratorio" && labSalones.length > 0) {
            assignment.set(v.id, labSalones[li++ % labSalones.length]!);
        } else if (normalSalones.length > 0) {
            assignment.set(v.id, normalSalones[ni++ % normalSalones.length]!);
        }
    }

    // Cuenta aristas donde ambos extremos recibieron el mismo salón (conflictos reales).
    let baselineConflicts = 0;
    for (const e of edges) {
        if (assignment.get(e.from.id) === assignment.get(e.to.id)) baselineConflicts++;
    }

    return {
        V: vertices.length,
        E: edges.length,
        totalSalones: input.salones.length,
        baselineConflicts
    };
}

// ─── Subgraph builder ─────────────────────────────────────────────────────────
// Builds isolated normal/lab subgraphs from a fresh conflict graph.

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

    return { graph, normalGraph, labGraph, normalSalones, labSalones };
}

// ─── Per-algorithm runners ─────────────────────────────────────────────────────
// Cada función construye subgrafos frescos (instancias de vértices separadas) para
// que las ejecuciones de algoritmos nunca compartan estado mutable de color.

interface RunResult {
    colors: number;
    valid:  boolean;
    timeMs: number;
}

function runVoraz(input: ScheduleInput): RunResult {
    const { normalGraph, labGraph, normalSalones, labSalones } = buildSubgraphs(input);
    const t0     = performance.now();
    const normal = new ColoreadorVoraz(normalGraph, normalSalones);
    const lab    = new ColoreadorVoraz(labGraph, labSalones);
    const nc     = normal.getColors();
    const lc     = lab.getColors();
    const nv     = normal.isValid();
    const lv     = lab.isValid();
    const timeMs = performance.now() - t0;
    const colors = new Set([...nc.values(), ...lc.values()]).size;
    return { colors, valid: nv && lv, timeMs };
}

function runWelshPowell(input: ScheduleInput): RunResult {
    const { normalGraph, labGraph, normalSalones, labSalones } = buildSubgraphs(input);
    const t0     = performance.now();
    const normal = new WelshPowell(normalGraph, normalSalones);
    const lab    = new WelshPowell(labGraph, labSalones);
    const nc     = normal.getColors();
    const lc     = lab.getColors();
    const nv     = normal.isValid();
    const lv     = lab.isValid();
    const timeMs = performance.now() - t0;
    const colors = new Set([...nc.values(), ...lc.values()]).size;
    return { colors, valid: nv && lv, timeMs };
}

function runDSatur(input: ScheduleInput): RunResult {
    const { normalGraph, labGraph, normalSalones, labSalones } = buildSubgraphs(input);
    const t0     = performance.now();
    const normal = new DSatur(normalGraph, normalSalones);
    const lab    = new DSatur(labGraph, labSalones);
    const nc     = normal.getColors();
    const lc     = lab.getColors();
    const nv     = normal.isValid();
    const lv     = lab.isValid();
    const timeMs = performance.now() - t0;
    const colors = new Set([...nc.values(), ...lc.values()]).size;
    return { colors, valid: nv && lv, timeMs };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const LINE = "═".repeat(74);
const DASH = "─".repeat(70);

console.log("\n" + LINE);
console.log("  COMPARACIÓN DE ESCENARIOS — 3 datasets × 3 algoritmos");
console.log(LINE);

for (const scenario of scenarios) {
    const metrics = computeScenarioMetrics(scenario.input);

    console.log(`\n  ${scenario.label}`);
    console.log(`  ${scenario.desc}`);
    console.log(`  Vértices: ${metrics.V}  |  Aristas: ${metrics.E}  |  Salones disponibles: ${metrics.totalSalones}`);
    console.log(`  Conflictos en asignación naive (round-robin): ${metrics.baselineConflicts}`);

    const header = [
        "Algoritmo".padEnd(15),
        "Colores".padEnd(9),
        "Uso%".padEnd(8),
        "Válido".padEnd(8),
        "Tiempo".padEnd(12),
        "Conf. resueltos",
    ].join(" ");
    console.log(`\n  ${header}`);
    console.log("  " + DASH);

    const runs: [string, RunResult][] = [
        ["Voraz",        runVoraz(scenario.input)],
        ["Welsh-Powell", runWelshPowell(scenario.input)],
        ["D-Satur",      runDSatur(scenario.input)],
    ];

    for (const [name, r] of runs) {
        const valid    = r.valid ? "✅" : "❌";
        const timeStr  = r.timeMs.toFixed(2) + " ms";
        const usageStr = (r.colors / metrics.totalSalones * 100).toFixed(1) + "%";
        // conflictos resueltos = baselineConflicts si el coloreo es válido (0 conflictos restantes)
        const resolved = r.valid ? metrics.baselineConflicts : 0;
        const resStr   = `${resolved} / ${metrics.baselineConflicts}`;

        console.log([
            "  " + name.padEnd(15),
            String(r.colors).padEnd(9),
            usageStr.padEnd(8),
            valid.padEnd(8),
            timeStr.padEnd(12),
            resStr,
        ].join(" "));
    }
}

console.log("\n" + LINE + "\n");
