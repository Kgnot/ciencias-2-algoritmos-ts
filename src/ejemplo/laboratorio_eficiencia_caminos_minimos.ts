import { BellmanFord } from "../algoritmos/camino-corto/Bellman-ford/bellman_ford.js";
import { Dijkstra } from "../algoritmos/camino-corto/Dijkstra/dijkstra.js";
import { FloydWarshall } from "../algoritmos/camino-corto/floyd-warshall/floyd_warshall.js";
import { Edge } from "../estructuras/edge.js";
import { Graph } from "../estructuras/graph/graph.js";
import { Vertex, VertexID } from "../estructuras/vertex.js";

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

type BenchmarkRow = {
    n: number;
    edges: number;
    avgTimeMs: number;
    repetitions: number;
    complexity: string;
};

// ─────────────────────────────────────────────────────────────
// CONSTRUCCIÓN DE GRAFOS
// Cada grafo refleja el caso de uso real del algoritmo.
// Los grafos se construyen UNA SOLA VEZ por tamaño,
// fuera de la medición, para no contaminar los tiempos.
// ─────────────────────────────────────────────────────────────

function createVertices(graph: Graph<string>, count: number): Vertex<string>[] {
    const vertices: Vertex<string>[] = [];
    for (let i = 0; i < count; i++) {
        const v = new Vertex<string>(new VertexID(`V${i}`), `Vertex ${i}`);
        graph.addVertex(v);
        vertices.push(v);
    }
    return vertices;
}

/**
 * Grafo disperso con pesos POSITIVOS.
 * Caso de uso de Dijkstra: single-source shortest path sin negativos.
 * Densidad ~2n aristas (cadena + salto 2), simula grafos de redes, mapas.
 */
function buildPositiveSparseGraph(n: number): Graph<string> {
    const graph = new Graph<string>(true);
    const v = createVertices(graph, n);

    for (let i = 0; i < n - 1; i++) {
        graph.addEdge(new Edge(v[i]!, v[i + 1]!, 1 + (i % 9), false, 0));
    }
    for (let i = 0; i < n - 2; i++) {
        graph.addEdge(new Edge(v[i]!, v[i + 2]!, 2 + (i % 7),false, 0));
    }

    return graph;
}

/**
 * Grafo disperso con algunos pesos NEGATIVOS, sin ciclos negativos.
 * Caso de uso de Bellman-Ford: cuando hay aristas negativas
 * (ej: descuentos, diferencias de potencial, sistemas financieros).
 */
function buildNegativeSparseGraph(n: number): Graph<string> {
    const graph = new Graph<string>(true);
    const v = createVertices(graph, n);

    for (let i = 0; i < n - 1; i++) {
        // Cada 4 aristas una es negativa — garantiza que no hay ciclo negativo
        // porque la estructura es una cadena hacia adelante (DAG-like)
        const weight = i % 4 === 0 ? -(1 + (i % 3)) : 2 + (i % 5);
        graph.addEdge(new Edge(v[i]!, v[i + 1]!, weight, false, 0));
    }
    for (let i = 0; i < n - 2; i++) {
        graph.addEdge(new Edge(v[i]!, v[i + 2]!, 1 + (i % 6), false, 0));
    }

    return graph;
}

/**
 * Grafo DENSO con pesos positivos — todas las aristas posibles.
 * Caso de uso de Floyd-Warshall: all-pairs shortest path.
 * Densidad n*(n-1) aristas — crece cuadráticamente con n.
 */
function buildDenseGraph(n: number): Graph<string> {
    const graph = new Graph<string>(true);
    const v = createVertices(graph, n);

    for (let from = 0; from < n; from++) {
        for (let to = 0; to < n; to++) {
            if (from !== to) {
                graph.addEdge(new Edge(v[from]!, v[to]!, 1 + ((from + to) % 13), false, 0));
            }
        }
    }

    return graph;
}

// ─────────────────────────────────────────────────────────────
// MEDICIÓN
// Usa performance.now() — resolución de microsegundos,
// a diferencia de Date.now() que solo tiene 1ms de resolución.
// El grafo se recibe ya construido: solo se mide el algoritmo.
// ─────────────────────────────────────────────────────────────

function measureAlgorithm(run: () => void, repetitions: number): number {
    // Warm-up: una ejecución previa para que el JIT compile el código
    // antes de que empiece la medición real
    run();

    const start = performance.now();
    for (let i = 0; i < repetitions; i++) {
        run();
    }
    return (performance.now() - start) / repetitions;
}

// ─────────────────────────────────────────────────────────────
// LABORATORIOS POR ALGORITMO
// ─────────────────────────────────────────────────────────────

/**
 * DIJKSTRA — O((V + E) log V) con heap; O(V²) con arreglo (esta impl.)
 * Grafos dispersos, pesos no negativos, un solo origen.
 * Tamaños más grandes porque es el más eficiente de los tres.
 */
function runDijkstraLab(): BenchmarkRow[] {
    const sizes = [50, 100, 200, 400, 800];
    const repetitions = 300;

    return sizes.map(n => {
        const graph = buildPositiveSparseGraph(n);
        const edges = graph.getEdges().length;
        const avgTimeMs = measureAlgorithm(
            () => new Dijkstra(graph, "V0"),
            repetitions
        );
        return { n, edges, avgTimeMs, repetitions, complexity: "O(V²) o O((V+E)logV)" };
    });
}

/**
 * BELLMAN-FORD — O(V * E)
 * Grafos con pesos negativos. Más lento que Dijkstra pero correcto
 * cuando hay negativos. También detecta ciclos negativos.
 * Tamaños menores porque crece más rápido (O(VE)).
 */
function runBellmanFordLab(): BenchmarkRow[] {
    const sizes = [20, 40, 60, 80, 100];
    const repetitions = 150;

    return sizes.map(n => {
        const graph = buildNegativeSparseGraph(n);
        const edges = graph.getEdges().length;
        const avgTimeMs = measureAlgorithm(
            () => new BellmanFord(graph, "V0"),
            repetitions
        );
        return { n, edges, avgTimeMs, repetitions, complexity: "O(V * E)" };
    });
}

/**
 * FLOYD-WARSHALL — O(V³)
 * Grafos densos, todos los pares origen-destino.
 * El más costoso asintóticamente — tamaños pequeños obligados.
 * La densidad del grafo es n*(n-1), coherente con su caso de uso real.
 */
function runFloydWarshallLab(): BenchmarkRow[] {
    const sizes = [10, 20, 30, 40, 50];
    const repetitions = 50;

    return sizes.map(n => {
        const graph = buildDenseGraph(n);
        const edges = graph.getEdges().length;
        const avgTimeMs = measureAlgorithm(
            () => new FloydWarshall(graph),
            repetitions
        );
        return { n, edges, avgTimeMs, repetitions, complexity: "O(V³)" };
    });
}

// ─────────────────────────────────────────────────────────────
// SALIDA
// ─────────────────────────────────────────────────────────────

function printTable(title: string, rows: BenchmarkRow[]) {
    console.log(`\n${"─".repeat(60)}`);
    console.log(title);
    console.log("─".repeat(60));
    console.table(
        rows.map(row => ({
            "V (vértices)":    row.n,
            "E (aristas)":     row.edges,
            "Complejidad":     row.complexity,
            "Reps":            row.repetitions,
            "Promedio (ms)":   row.avgTimeMs.toFixed(4),
        }))
    );
}

function printHeader() {
    console.log("\n" + "═".repeat(60));
    console.log("LABORATORIO DE EFICIENCIA — CAMINOS MÁS CORTOS");
    console.log("═".repeat(60));
    console.log("Medición: performance.now() — resolución de microsegundos");
    console.log("Metodología: 1 warm-up + N repeticiones / grafo preconstruido");
    console.log("Cada algoritmo se prueba en su caso de uso adecuado.");
}

function printAnalysis(
    dijkstraRows: BenchmarkRow[],
    bellmanRows: BenchmarkRow[],
    floydRows: BenchmarkRow[]
) {
    console.log("\n" + "═".repeat(60));
    console.log("ANÁLISIS DE RESULTADOS");
    console.log("═".repeat(60));

    console.log(`
DIJKSTRA  — O(V²) con arreglo / O((V+E)logV) con heap binario
  Caso de uso : Un solo origen, pesos no negativos (GPS, redes, rutas).
  Restricción : No funciona con aristas negativas.
  Observación : El tiempo crece aproximadamente cuadrático en V porque
                esta implementación usa arreglo en lugar de heap.
                Con heap el crecimiento sería mucho más suave.

BELLMAN-FORD — O(V × E)
  Caso de uso : Un solo origen, permite pesos negativos.
                Detecta ciclos negativos (retorna error o flag).
  Restricción : Más lento que Dijkstra en grafos sin negativos.
  Observación : Al ser O(V×E), con grafos dispersos (E≈2V) se comporta
                como O(V²), pero con grafos densos (E≈V²) degenera a O(V³).

FLOYD-WARSHALL — O(V³)
  Caso de uso : Todos los pares origen-destino en grafos densos o pequeños.
                Útil cuando se necesitan múltiples consultas origen-destino.
  Restricción : Inviable para V > 500 aprox. por consumo de tiempo y memoria.
  Observación : A pesar del O(V³), es práctico en grafos pequeños/densos
                porque el costo fijo de una sola ejecución cubre todos los pares.
                Dijkstra corrido V veces tendría el mismo costo total en esos casos.
`);

    // Comparación puntual: ¿cuánto más tarda Bellman vs Dijkstra al mismo V?
    const dAt100 = dijkstraRows.find(r => r.n === 100);
    const bAt100 = bellmanRows.find(r => r.n === 100);
    if (dAt100 && bAt100) {
        const ratio = bAt100.avgTimeMs / dAt100.avgTimeMs;
        console.log(`Comparación directa a V=100 (grafo disperso):`);
        console.log(`  Dijkstra   : ${dAt100.avgTimeMs.toFixed(4)} ms`);
        console.log(`  Bellman-Ford: ${bAt100.avgTimeMs.toFixed(4)} ms`);
        console.log(`  Ratio      : Bellman-Ford es ×${ratio.toFixed(1)} más lento\n`);
    }

    // Crecimiento observado de Floyd: verifica que escala ~V³
    const f = floydRows;
    if (f.length >= 2) {
        const last  = f[f.length - 1]!;
        const prev  = f[f.length - 2]!;
        const vRatio = last.n / prev.n
        const tRatio = last.avgTimeMs / prev.avgTimeMs;
        const expected = Math.pow(vRatio, 3);
        console.log(`Verificación de O(V³) en Floyd-Warshall:`);
        console.log(`  V creció ×${vRatio.toFixed(2)} → tiempo esperado ×${expected.toFixed(2)}, observado ×${tRatio.toFixed(2)}`);
        const accurate = Math.abs(tRatio - expected) / expected < 0.5;
        console.log(`  ${accurate ? "✓ Consistente con O(V³)" : "~ Ruido de medición o constantes dominando — aumentar tamaños"}\n`);
    }
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

function main() {
    printHeader();

    const dijkstraRows   = runDijkstraLab();
    const bellmanFordRows = runBellmanFordLab();
    const floydRows      = runFloydWarshallLab();

    printTable(
        "1. DIJKSTRA — grafo disperso, pesos positivos, origen único",
        dijkstraRows
    );
    printTable(
        "2. BELLMAN-FORD — grafo disperso, pesos negativos, origen único",
        bellmanFordRows
    );
    printTable(
        "3. FLOYD-WARSHALL — grafo denso, todos los pares",
        floydRows
    );

    printAnalysis(dijkstraRows, bellmanFordRows, floydRows);
}

main();