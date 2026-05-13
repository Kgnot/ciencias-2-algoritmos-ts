// Ejemplo completo de uso de los algoritmos de caminos mínimos

import {Graph} from "../estructuras/graph/graph.js";
import {Vertex, VertexID} from "../estructuras/vertex.js";
import {Edge} from "../estructuras/edge.js";
import {toIncidenceMatrix} from "../estructuras/proyeccion/incidence_matrix.js";
import {toIncidenceList} from "../estructuras/proyeccion/incidence_list.js";
import {Dijkstra} from "../algoritmos/camino-corto/Dijkstra/dijkstra.js";
import {BellmanFord} from "../algoritmos/camino-corto/Bellman-ford/bellman_ford.js";
import {FloydWarshall} from "../algoritmos/camino-corto/floyd-warshall/floyd_warshall.js";
import {toAdjacencyMatrix} from "../estructuras/proyeccion/adjacency_matrix.js";
import {toAdjacencyList} from "../estructuras/proyeccion/adjacency_list.js";
import {FordFulkerson} from "../algoritmos/flujo/ford-fulkerson/ford-fulkerson.js";

export function ejecutarEjemplo() {
    console.log("=".repeat(60));
    console.log("CREANDO GRAFO DE EJEMPLO");
    console.log("=".repeat(60));

    // Crear grafo dirigido
    const graph = new Graph<string>(true);

    // Crear vértices
    const A = new Vertex<string>(new VertexID("A"), "Vertex A");
    const B = new Vertex<string>(new VertexID("B"), "Vertex B");
    const C = new Vertex<string>(new VertexID("C"), "Vertex C");
    const D = new Vertex<string>(new VertexID("D"), "Vertex D");
    const E = new Vertex<string>(new VertexID("E"), "Vertex E");
    const F = new Vertex<string>(new VertexID("F"), "Vertex F");
    const G = new Vertex<string>(new VertexID("G"), "Vertex G");

    // Agregar vértices al grafo
    graph.addVertex(A);
    graph.addVertex(B);
    graph.addVertex(C);
    graph.addVertex(D);
    graph.addVertex(E);
    graph.addVertex(F);
    graph.addVertex(G);

    // Crear aristas
    const e1 = new Edge<string>(A, B, 50, true, 10);
    const e2 = new Edge<string>(B, D, 40, true, 15);
    const e3 = new Edge<string>(A, G, 70, true, 7);
    const e4 = new Edge<string>(B, C, 20, true, 8);
    const e5 = new Edge<string>(C, D, 15, true, 5);
    const e6 = new Edge<string>(C, G, 12, true, 9);
    const e7 = new Edge<string>(F, D, 27, true, 50);
    const e8 = new Edge<string>(F, E, -10, true, 15);
    const e9 = new Edge<string>(D, E, 15, true, 30);
    const e10 = new Edge<string>(F, G, 30, true, 8);

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
    const ford_fulkerson = new FordFulkerson(graph);
    const flow = ford_fulkerson.execute("A", "E");
    console.log("Flow: " + flow)
}