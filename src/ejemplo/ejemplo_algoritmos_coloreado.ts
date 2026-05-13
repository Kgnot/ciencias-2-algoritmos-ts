import {Graph} from "../estructuras/graph/graph.js";
import {Vertex, COLOR} from "../estructuras/vertex.js";
import {Edge} from "../estructuras/edge.js";
import {ColoreadorVoraz} from "../algoritmos/coloreado/coloreado-voraz/coloreado-voraz.js";
import {DSatur} from "../algoritmos/coloreado/D-Satur/d-satur.js";
import {WelshPowell} from "../algoritmos/coloreado/Whelsh-Powell/whelsh-powell.js";
import {
    aplicarColoresAlGrafo,
    obtenerRepresentacionColores,
    toColoresVisuales
} from "../estructuras/proyeccion/colores.js";

// creamos cualquier grafo
function crearGrafoEjemplo(): Graph<string> {
    const grafo = new Graph<string>(false); // No dirigido

    // Crear vértices
    const v1 = new Vertex("1", "Nodo 1");
    const v2 = new Vertex("2", "Nodo 2");
    const v3 = new Vertex("3", "Nodo 3");
    const v4 = new Vertex("4", "Nodo 4");
    const v5 = new Vertex("5", "Nodo 5");
    const v6 = new Vertex("6", "Nodo 6");
    const v7 = new Vertex("7", "Nodo 7");

    // Agregar vértices
    grafo.addVertex(v1);
    grafo.addVertex(v2);
    grafo.addVertex(v3);
    grafo.addVertex(v4);
    grafo.addVertex(v5);
    grafo.addVertex(v6);
    grafo.addVertex(v7);

    // Crear aristas (grafo no dirigido)
    grafo.addEdge(new Edge(v1, v2, 1, false, 0));
    grafo.addEdge(new Edge(v1, v3, 1, false, 0));
    grafo.addEdge(new Edge(v2, v3, 1, false, 0));
    grafo.addEdge(new Edge(v2, v4, 1, false, 0));
    grafo.addEdge(new Edge(v3, v4, 1, false, 0));
    grafo.addEdge(new Edge(v3, v5, 1, false, 0));
    grafo.addEdge(new Edge(v4, v5, 1, false, 0));
    grafo.addEdge(new Edge(v4, v6, 1, false, 0));
    grafo.addEdge(new Edge(v5, v6, 1, false, 0));
    grafo.addEdge(new Edge(v5, v7, 1, false, 0));
    grafo.addEdge(new Edge(v6, v7, 1, false, 0));

    return grafo;
}

// aqui solamente iprimomos la info del algoritmo
function imprimirResultado(
    nombreAlgoritmo: string,
    numColores: number,
    coloresMap: Map<string, COLOR | string>,
    esValido: boolean
): void {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`  ${nombreAlgoritmo}`);
    console.log(`${"═".repeat(60)}`);
    console.log(`Número de colores utilizados: ${numColores}`);
    console.log(`Coloración válida: ${esValido ? "✓ SÍ" : "✗ NO"}`);

    const porColor = toColoresVisuales(coloresMap);
    console.log("\nAsignación de colores:");
    for (let i = 0; i < numColores; i++) {
        const vertices = porColor.get(i) ?? [];
        console.log(`  Color ${i}: ${vertices.join(", ")}`);
    }
}

// reiniciamos colores del grafo a blanco
function reiniciarColoresGrafo<T>(grafo: Graph<T>): void {
    for (const vertex of grafo.getVertex()) {
        vertex.setColor(COLOR.WHITE);
    }
}

// este es el ejemplo
export function ejemploColoreado(): void {
    console.log("\n");
    console.log("╔" + "═".repeat(58) + "╗");
    console.log("║" + " ".repeat(58) + "║");
    console.log("║" + "  EJEMPLO: ALGORITMOS DE COLORACIÓN DE GRAFOS".padEnd(58) + "║");
    console.log("║" + " ".repeat(58) + "║");
    console.log("╚" + "═".repeat(58) + "╝");

    // Crear grafo
    const grafo = crearGrafoEjemplo();

    // Información del grafo
    console.log("\nInformación del Grafo:");
    console.log(`   Vértices: ${grafo.getVertex().length}`);
    console.log(`   Aristas: ${grafo.getEdges().length}`);
    console.log(`   Tipo: ${grafo.isDirected() ? "Dirigido" : "No dirigido"}`);

    console.log("\nVértices y Grados:");
    for (const vertex of grafo.getVertex()) {
        const grado = grafo.getEdges().filter(
            e => e.from.id === vertex.id || e.to.id === vertex.id
        ).length;
        console.log(`   ${vertex.id}: grado = ${grado}`);
    }

    console.log("\n");

    // ════════════════════════════════════════════════════════════════
    // ALGORITMO 1: COLOREADOR VORAZ
    // ════════════════════════════════════════════════════════════════

    reiniciarColoresGrafo(grafo);
    const coloradorVoraz = new ColoreadorVoraz(grafo);
    const coloresVoraz = coloradorVoraz.getColors();
    const numColoresVoraz = coloradorVoraz.getNumColors();

    imprimirResultado(
        "COLOREADOR VORAZ (Greedy)",
        numColoresVoraz,
        coloresVoraz,
        coloradorVoraz.isValid()
    );

    // Aplicar colores al grafo
    aplicarColoresAlGrafo(coloresVoraz, grafo);
    console.log("\n" + obtenerRepresentacionColores(grafo));

    // ════════════════════════════════════════════════════════════════
    // ALGORITMO 2: D-SATUR
    // ════════════════════════════════════════════════════════════════

    reiniciarColoresGrafo(grafo);
    const dsatur = new DSatur(grafo);
    const coloresDSatur: Map<COLOR | string, string> = dsatur.getColors();
    const numColoresDSatur = dsatur.getNumColors();

    imprimirResultado("D-SATUR (Degree of Saturation)", numColoresDSatur, coloresDSatur, dsatur.isValid
    ());

    // Aplicar colores al grafo
    aplicarColoresAlGrafo(coloresDSatur, grafo);
    console.log("\n" + obtenerRepresentacionColores(grafo));

    // ════════════════════════════════════════════════════════════════
    // ALGORITMO 3: WELSH-POWELL
    // ════════════════════════════════════════════════════════════════

    reiniciarColoresGrafo(grafo);
    const welshPowell = new WelshPowell(grafo);
    const coloresWelshPowell = welshPowell.getColors();
    const numColoresWelshPowell = welshPowell.getNumColors();

    imprimirResultado("WELSH-POWELL", numColoresWelshPowell, coloresWelshPowell, welshPowell.isValid());

    // Aplicar colores al grafo
    aplicarColoresAlGrafo(coloresWelshPowell, grafo);
    console.log("\n" + obtenerRepresentacionColores(grafo));

    // ════════════════════════════════════════════════════════════════
    // COMPARACIÓN
    // ════════════════════════════════════════════════════════════════

    console.log("\n");
    console.log("╔" + "═".repeat(58) + "╗");
    console.log("║" + "  COMPARACIÓN DE RESULTADOS".padEnd(58) + "║");
    console.log("╚" + "═".repeat(58) + "╝");

    console.log("\n" +
        " Tabla Comparativa:");
    console.log(`
┌─────────────────┬──────────────┬──────────────┐
│   Algoritmo     │  Colores     │   Válido     │
├─────────────────┼──────────────┼──────────────┤
│ Voraz           │      ${numColoresVoraz}       │     ${coloradorVoraz.isValid() ? "✓" : "✗"}        │
│ D-Satur         │      ${numColoresDSatur}       │     ${dsatur.isValid() ? "✓" : "✗"}        │
│ Welsh-Powell    │      ${numColoresWelshPowell}       │     ${welshPowell.isValid() ? "✓" : "✗"}        │
└─────────────────┴──────────────┴──────────────┘
    `);

    console.log("📌 Resumen:");
    console.log(`   • Coloreador Voraz: ${numColoresVoraz} colores`);
    console.log(`   • D-Satur: ${numColoresDSatur} colores`);
    console.log(`   • Welsh-Powell: ${numColoresWelshPowell} colores`);
    console.log(`   • Mejor: ${Math.min(numColoresVoraz, numColoresDSatur, numColoresWelshPowell)} colores`);

    console.log("\n Coloración completada exitosamente.\n");
}

// Ejecutar el ejemplo
ejemploColoreado();
