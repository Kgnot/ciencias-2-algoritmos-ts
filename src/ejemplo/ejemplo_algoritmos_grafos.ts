// Ejemplo completo de uso de los algoritmos de caminos mínimos

import { Graph } from "../estructuras/graph/graph.js";
import { Vertex } from "../estructuras/vertex.js";
import { Edge } from "../estructuras/edge.js";
import { toIncidenceMatrix } from "../estructuras/proyeccion/incidence_matrix.js";
import { toIncidenceList } from "../estructuras/proyeccion/incidence_list.js";
import { Dijkstra } from "../algoritmos/Dijkstra/dijkstra.js";
import { BellmanFord } from "../algoritmos/Bellman-ford/bellman_ford.js";
import { FloydWarshall } from "../algoritmos/floyd-warshall/floyd_warshall.js";
import { toAdjacencyMatrix } from "../estructuras/proyeccion/adjacency_list.js";
import { toAdjacencyList } from "../estructuras/proyeccion/adjacency_matrix.js";

export function ejecutarEjemplo() {
    console.log("=".repeat(60));
    console.log("CREANDO GRAFO DE EJEMPLO");
    console.log("=".repeat(60));

    // Crear grafo dirigido
    const graph = new Graph<string>(true);

    // Crear vértices
    const A = new Vertex<string>("A", "Vertex A");
    const B = new Vertex<string>("B", "Vertex B");
    const C = new Vertex<string>("C", "Vertex C");
    const D = new Vertex<string>("D", "Vertex D");
    const E = new Vertex<string>("E", "Vertex E");
    const F = new Vertex<string>("F", "Vertex F");
    const G = new Vertex<string>("G", "Vertex G");

    // Agregar vértices al grafo
    graph.addVertex(A);
    graph.addVertex(B);
    graph.addVertex(C);
    graph.addVertex(D);
    graph.addVertex(E);
    graph.addVertex(F);
    graph.addVertex(G);

    // Crear aristas
    const e1 = new Edge<string>(A, B, 50);
    const e2 = new Edge<string>(B, D, 40);
    const e3 = new Edge<string>(A, G, 70);
    const e4 = new Edge<string>(B, C, 20);
    const e5 = new Edge<string>(C, D, 15);
    const e6 = new Edge<string>(C, G, 12);
    const e7 = new Edge<string>(F, D, 27);
    const e8 = new Edge<string>(F, E, -10);
    const e9 = new Edge<string>(D, E, 15);
    const e10 = new Edge<string>(F, G, 30);

    // Agregar aristas al grafo
    graph.addEdge(e1);
    graph.addEdge(e2);
    graph.addEdge(e3);
    graph.addEdge(e4);
    graph.addEdge(e5);
    graph.addEdge(e6);
    graph.addEdge(e7);
    graph.addEdge(e8);
    graph.addEdge(e9);
    graph.addEdge(e10);

    // Representaciones
    const listAdjacency = toAdjacencyList(graph);
    const matrixAdjacency = toAdjacencyMatrix(graph);
    const matrixIncidence = toIncidenceMatrix(graph);
    const incidenceList = toIncidenceList(graph);

    console.log("\nLista de Adyacencia:");
    console.log(listAdjacency);
    // ============================================================
    // DIJKSTRA
    // ============================================================
    console.log("\n" + "=".repeat(60));
    console.log("DIJKSTRA");
    console.log("=".repeat(60));

    const dijkstra = new Dijkstra(graph, "A");
    console.log("\nDistancias desde 'A':");
    console.log("   A -> B:", dijkstra.getDistance("B"));
    console.log("   A -> C:", dijkstra.getDistance("C"));
    console.log("   A -> D:", dijkstra.getDistance("D"));
    console.log("   A -> E:", dijkstra.getDistance("E"));
    console.log("   A -> F:", dijkstra.getDistance("F"));
    console.log("   A -> G:", dijkstra.getDistance("G"));

    console.log("\nCamino A -> E:", dijkstra.getPath("E").join(" -> "));
    console.log("Camino A -> G:", dijkstra.getPath("G").join(" -> "));

    // ============================================================
    // BELLMAN-FORD
    // ============================================================
    console.log("\n" + "=".repeat(60));
    console.log("BELLMAN-FORD");
    console.log("=".repeat(60));

    const bellmanFord = new BellmanFord(graph, "A");
    console.log("\nDistancias desde 'A':");
    console.log("   A -> B:", bellmanFord.getDistance("B"));
    console.log("   A -> C:", bellmanFord.getDistance("C"));
    console.log("   A -> D:", bellmanFord.getDistance("D"));
    console.log("   A -> E:", bellmanFord.getDistance("E"));
    console.log("   A -> F:", bellmanFord.getDistance("F"));
    console.log("   A -> G:", bellmanFord.getDistance("G"));

    console.log("\nCamino A -> E:", bellmanFord.getPath("E").join(" -> "));
    console.log("Camino A -> F:", bellmanFord.getPath("F").join(" -> "));

    // ============================================================
    // FLOYD-WARSHALL
    // ============================================================
    console.log("\n" + "=".repeat(60));
    console.log("FLOYD-WARSHALL");
    console.log("=".repeat(60));

    const floyd = new FloydWarshall(graph);
    console.log(floyd.getAllDistances())
    console.log("\nDistancia A -> E:", floyd.getDistance("A", "E"));
    console.log("Camino A -> E:", floyd.getPath("A", "E").join(" -> "));

    console.log("\nDistancia F -> G:", floyd.getDistance("F", "G"));
    console.log("Camino F -> G:", floyd.getPath("F", "G").join(" -> "));

    console.log("\nDistancia G -> A:", floyd.getDistance("G", "A"));
    console.log("Camino G -> A:", floyd.getPath("G", "A").join(" -> "));

    console.log("\n" + "=".repeat(60));
    console.log("EJECUCION COMPLETADA");
    console.log("=".repeat(60));
}