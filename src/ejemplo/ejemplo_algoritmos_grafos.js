"use strict";
// Ejemplo completo de uso de los algoritmos de caminos mínimos
Object.defineProperty(exports, "__esModule", { value: true });
exports.ejecutarEjemplo = ejecutarEjemplo;
var graph_1 = require("../estructuras/graph/graph");
var vertex_1 = require("../estructuras/vertex");
var edge_1 = require("../estructuras/edge");
var ford_fulkerson_1 = require("../algoritmos/flujo/ford-fulkerson/ford-fulkerson");
function ejecutarEjemplo() {
    console.log("=".repeat(60));
    console.log("CREANDO GRAFO DE EJEMPLO");
    console.log("=".repeat(60));
    // Crear grafo dirigido
    var graph = new graph_1.Graph(true);
    // Crear vértices
    var A = new vertex_1.Vertex(("A"), "Vertex A");
    var B = new vertex_1.Vertex(("B"), "Vertex B");
    var C = new vertex_1.Vertex(("C"), "Vertex C");
    var D = new vertex_1.Vertex(("D"), "Vertex D");
    var E = new vertex_1.Vertex(("E"), "Vertex E");
    var F = new vertex_1.Vertex(("F"), "Vertex F");
    var G = new vertex_1.Vertex(("G"), "Vertex G");
    // Agregar vértices al grafo
    graph.addVertex(A);
    graph.addVertex(B);
    graph.addVertex(C);
    graph.addVertex(D);
    graph.addVertex(E);
    graph.addVertex(F);
    graph.addVertex(G);
    // Crear aristas
    var e1 = new edge_1.Edge(A, B, 50, true, 10);
    var e2 = new edge_1.Edge(B, D, 40, true, 15);
    var e3 = new edge_1.Edge(A, G, 70, true, 7);
    var e4 = new edge_1.Edge(B, C, 20, true, 8);
    var e5 = new edge_1.Edge(C, D, 15, true, 5);
    var e6 = new edge_1.Edge(C, G, 12, true, 9);
    var e7 = new edge_1.Edge(F, D, 27, true, 50);
    var e8 = new edge_1.Edge(F, E, -10, true, 15);
    var e9 = new edge_1.Edge(D, E, 15, true, 30);
    var e10 = new edge_1.Edge(F, G, 30, true, 8);
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
    // const listAdjacency = toAdjacencyList(graph);
    // const matrixAdjacency = toAdjacencyMatrix(graph);
    // const matrixIncidence = toIncidenceMatrix(graph);
    // const incidenceList = toIncidenceList(graph);
    // console.log("\nLista de Adyacencia:");
    // console.log(listAdjacency);
    // // ============================================================
    // // DIJKSTRA
    // // ============================================================
    // console.log("\n" + "=".repeat(60));
    // console.log("DIJKSTRA");
    // console.log("=".repeat(60));
    // const dijkstra = new Dijkstra(graph, "A");
    // console.log("\nDistancias desde 'A':");
    // console.log("   A -> B:", dijkstra.getDistance("B"));
    // console.log("   A -> C:", dijkstra.getDistance("C"));
    // console.log("   A -> D:", dijkstra.getDistance("D"));
    // console.log("   A -> E:", dijkstra.getDistance("E"));
    // console.log("   A -> F:", dijkstra.getDistance("F"));
    // console.log("   A -> G:", dijkstra.getDistance("G"));
    // console.log("\nCamino A -> E:", dijkstra.getPath("E").join(" -> "));
    // console.log("Camino A -> G:", dijkstra.getPath("G").join(" -> "));
    // // ============================================================
    // // BELLMAN-FORD
    // // ============================================================
    // console.log("\n" + "=".repeat(60));
    // console.log("BELLMAN-FORD");
    // console.log("=".repeat(60));
    // const bellmanFord = new BellmanFord(graph, "A");
    // console.log("\nDistancias desde 'A':");
    // console.log("   A -> B:", bellmanFord.getDistance("B"));
    // console.log("   A -> C:", bellmanFord.getDistance("C"));
    // console.log("   A -> D:", bellmanFord.getDistance("D"));
    // console.log("   A -> E:", bellmanFord.getDistance("E"));
    // console.log("   A -> F:", bellmanFord.getDistance("F"));
    // console.log("   A -> G:", bellmanFord.getDistance("G"));
    // console.log("\nCamino A -> E:", bellmanFord.getPath("E").join(" -> "));
    // console.log("Camino A -> F:", bellmanFord.getPath("F").join(" -> "));
    // // ============================================================
    // // FLOYD-WARSHALL
    // // ============================================================
    // console.log("\n" + "=".repeat(60));
    // console.log("FLOYD-WARSHALL");
    // console.log("=".repeat(60));
    // const floyd = new FloydWarshall(graph);
    // console.log(floyd.getAllDistances())
    // console.log("\nDistancia A -> E:", floyd.getDistance("A", "E"));
    // console.log("Camino A -> E:", floyd.getPath("A", "E").join(" -> "));
    // console.log("\nDistancia F -> G:", floyd.getDistance("F", "G"));
    // console.log("Camino F -> G:", floyd.getPath("F", "G").join(" -> "));
    // console.log("\nDistancia G -> A:", floyd.getDistance("G", "A"));
    // console.log("Camino G -> A:", floyd.getPath("G", "A").join(" -> "));
    // console.log("\n" + "=".repeat(60));
    // console.log("EJECUCION COMPLETADA");
    // console.log("=".repeat(60));
    // FORD FULKERSON
    var ford_fulkerson = new ford_fulkerson_1.FordFulkerson(graph);
    var flow = ford_fulkerson.execute(("A"), ("E"));
    console.log("Flow: " + flow);
}
