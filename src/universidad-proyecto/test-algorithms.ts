import { SchedulerDataLoader } from "./data/scheduler-data-loader.js";
import { DSatur } from "../algoritmos/coloreado/D-Satur/d-satur.js";
import { ColoreadorVoraz } from "../algoritmos/coloreado/coloreado-voraz/coloreado-voraz.js";
import { WelshPowell } from "../algoritmos/coloreado/Whelsh-Powell/whelsh-powell.js";
import { Graph } from "../estructuras/graph/graph.js";
import { Vertex } from "../estructuras/vertex.js";
import { Edge } from "../estructuras/edge.js";
import type { GrupoData } from "./logic/models/grupo-data.model.js";
import {ConflictGraphBuilder} from "./logic/schedule/conflict-graph/conflict-graph-builder.js";

const loader        = SchedulerDataLoader.build();
const scheduleInput = loader.getData();

// Grafo fresco por cada algoritmo para evitar que setColor() contamine entre ejecuciones
function buildFreshSubgraphs() {
    const { graph } = new ConflictGraphBuilder(scheduleInput).build();

    const salones      = scheduleInput.salones;
    const normalSalones = salones.filter(s => s.tipo === "normal").map(s => s.id);
    const labSalones    = salones.filter(s => s.tipo === "laboratorio").map(s => s.id);

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
            const f = labMap.get(e.from.id)!;
            const t = labMap.get(e.to.id)!;
            labGraph.addEdge(new Edge(f, t, e.weight, e.directed, e.maxFlow));
        } else {
            const f = normalMap.get(e.from.id)!;
            const t = normalMap.get(e.to.id)!;
            normalGraph.addEdge(new Edge(f, t, e.weight, e.directed, e.maxFlow));
        }
    }

    return { graph, normalGraph, labGraph, normalSalones, labSalones };
}

// ─── Stats iniciales (un solo grafo de referencia) ───────────────────────────
const { graph: refGraph, normalSalones: ns, labSalones: ls } = buildFreshSubgraphs();

console.log("\n🔬 COMPARACIÓN DE ALGORITMOS");
console.log("=".repeat(60));
console.log(`📊 Grafo: ${refGraph.getVertex().length} vértices, ${refGraph.getEdges().length} aristas`);
console.log("=".repeat(60));

// ─── Voraz ────────────────────────────────────────────────────────────────────
console.log("\n🟢 COLORACIÓN VORAZ");
{
    const { normalGraph, labGraph, normalSalones, labSalones } = buildFreshSubgraphs();
    const vorazNormal = new ColoreadorVoraz(normalGraph, normalSalones);
    const vorazLab    = new ColoreadorVoraz(labGraph, labSalones);
    const colors      = new Map([...vorazNormal.getColors(), ...vorazLab.getColors()]);
    console.log(`   Colores usados: ${new Set(colors.values()).size}`);
    console.log(`   Válido: ${vorazNormal.isValid() && vorazLab.isValid() ? "✅ Sí" : "❌ No"}`);
}

// ─── Welsh-Powell ─────────────────────────────────────────────────────────────
console.log("\n🟡 WELSH-POWELL");
{
    const { normalGraph, labGraph, normalSalones, labSalones } = buildFreshSubgraphs();
    const wpNormal = new WelshPowell(normalGraph, normalSalones);
    const wpLab    = new WelshPowell(labGraph, labSalones);
    const colors   = new Map([...wpNormal.getColors(), ...wpLab.getColors()]);
    console.log(`   Colores usados: ${new Set(colors.values()).size}`);
    console.log(`   Válido: ${wpNormal.isValid() && wpLab.isValid() ? "✅ Sí" : "❌ No"}`);
}

// ─── D-Satur ──────────────────────────────────────────────────────────────────
console.log("\n🔵 D-SATUR");
{
    const { normalGraph, labGraph, normalSalones, labSalones } = buildFreshSubgraphs();
    const dsNormal = new DSatur(normalGraph, normalSalones);
    const dsLab    = new DSatur(labGraph, labSalones);
    const colors   = new Map([...dsNormal.getColors(), ...dsLab.getColors()]);
    console.log(`   Colores usados: ${new Set(colors.values()).size}`);
    console.log(`   Válido: ${dsNormal.isValid() && dsLab.isValid() ? "✅ Sí" : "❌ No"}`);
}

console.log("\n" + "=".repeat(60));