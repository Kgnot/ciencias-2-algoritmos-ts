import { SchedulerDataLoader } from "./data/scheduler-data-loader.js";
import { ConflictGraphBuilder } from "./logic/conflict-graph.logic.js";
import { DSatur } from "../algoritmos/D-Satur/d-satur.js";
import { ColoreadorVoraz } from "../algoritmos/coloreado-voraz/coloreado-voraz.js";
import { WelshPowell } from "../algoritmos/Whelsh-Powell/whelsh-powell.js";
import { Graph } from "../estructuras/graph/graph.js";
import { Vertex } from "../estructuras/vertex.js";
import { Edge } from "../estructuras/edge.js";
import type { GrupoData } from "./models/grupo-data.model.js";

const loader = SchedulerDataLoader.build();
const scheduleInput = loader.getData();
const { graph } = new ConflictGraphBuilder(scheduleInput).build();

const salones = scheduleInput.salones;
const normalSalones = salones.filter(s => s.tipo === "normal").map(s => s.id);
const labSalones = salones.filter(s => s.tipo === "laboratorio").map(s => s.id);

// Separar grafos por tipo
const normalGraph = new Graph<GrupoData>(false);
const labGraph = new Graph<GrupoData>(false);
const normalVertexMap = new Map<string, Vertex<GrupoData>>();
const labVertexMap = new Map<string, Vertex<GrupoData>>();

for (const v of graph.getVertex()) {
    const data = v.getValue();
    const copy = new Vertex<GrupoData>(v.id, data);
    if (data.tipoSalon === "laboratorio") {
        labGraph.addVertex(copy);
        labVertexMap.set(copy.id, copy);
    } else {
        normalGraph.addVertex(copy);
        normalVertexMap.set(copy.id, copy);
    }
}

for (const e of graph.getUniqueEdges()) {
    const fromType = e.from.getValue().tipoSalon;
    const toType = e.to.getValue().tipoSalon;
    if (fromType === toType) {
        if (fromType === "laboratorio") {
            labGraph.addEdge(new Edge(labVertexMap.get(e.from.id)!, labVertexMap.get(e.to.id)!, e.weight, e.directed, e.maxFlow));
        } else {
            normalGraph.addEdge(new Edge(normalVertexMap.get(e.from.id)!, normalVertexMap.get(e.to.id)!, e.weight, e.directed, e.maxFlow));
        }
    }
}

console.log("\n🔬 COMPARACIÓN DE ALGORITMOS");
console.log("=".repeat(60));
console.log(`📊 Grafo original: ${graph.getVertex().length} vértices, ${graph.getEdges().length} aristas`);
console.log(`📊 Normales: ${normalGraph.getVertex().length} vértices`);
console.log(`📊 Laboratorios: ${labGraph.getVertex().length} vértices`);
console.log("=".repeat(60));

// Voraz
console.log("\n🟢 COLORACIÓN VORAZ");
const vorazNormal = new ColoreadorVoraz(normalGraph, normalSalones);
const vorazLab = new ColoreadorVoraz(labGraph, labSalones);
const vorazColors = new Map<string, string>();
for (const [id, c] of vorazNormal.getColors()) vorazColors.set(id, c as string);
for (const [id, c] of vorazLab.getColors()) vorazColors.set(id, c as string);
console.log(`   Colores usados: ${new Set(vorazColors.values()).size}`);
console.log(`   Válido: ${vorazNormal.isValid() && vorazLab.isValid() ? "✅ Sí" : "❌ No"}`);

// Welsh-Powell
console.log("\n🟡 WELSH-POWELL");
const wpNormal = new WelshPowell(normalGraph, normalSalones);
const wpLab = new WelshPowell(labGraph, labSalones);
const wpColors = new Map<string, string>();
for (const [id, c] of wpNormal.getColors()) wpColors.set(id, c as string);
for (const [id, c] of wpLab.getColors()) wpColors.set(id, c as string);
console.log(`   Colores usados: ${new Set(wpColors.values()).size}`);
console.log(`   Válido: ${wpNormal.isValid() && wpLab.isValid() ? "✅ Sí" : "❌ No"}`);

// D-Satur
console.log("\n🔵 D-SATUR");
const dsaturNormal = new DSatur(normalGraph, normalSalones);
const dsaturLab = new DSatur(labGraph, labSalones);
const dsaturColors = new Map<string, string>();
for (const [id, c] of dsaturNormal.getColors()) dsaturColors.set(id, c as string);
for (const [id, c] of dsaturLab.getColors()) dsaturColors.set(id, c as string);
console.log(`   Colores usados: ${new Set(dsaturColors.values()).size}`);
console.log(`   Válido: ${dsaturNormal.isValid() && dsaturLab.isValid() ? "✅ Sí" : "❌ No"}`);

console.log("\n" + "=".repeat(60));
console.log("📈 RESUMEN:");
console.log(`   Voraz:        ${new Set(vorazColors.values()).size} salones`);
console.log(`   Welsh-Powell: ${new Set(wpColors.values()).size} salones`);
console.log(`   D-Satur:      ${new Set(dsaturColors.values()).size} salones`);

if (new Set(vorazColors.values()).size === new Set(wpColors.values()).size &&
    new Set(wpColors.values()).size === new Set(dsaturColors.values()).size) {
    console.log("\n⚠️ ADVERTENCIA: Los tres algoritmos dieron el MISMO resultado.");
    console.log("   Posibles causas:");
    console.log("   1. El grafo tiene componentes desconectadas");
    console.log("   2. Hay suficientes colores (salones) para todos");
    console.log("   3. Los algoritmos no están implementados correctamente");
} else {
    console.log("\n✅ Los algoritmos dan resultados DIFERENTES - Está funcionando bien!");
}