import { Kruskal } from "../algoritmos/arbol-expancion-minima/kruskal/kurskal.js";
import { Prim } from "../algoritmos/arbol-expancion-minima/prim/prim.js";
import { Edge } from "../estructuras/edge.js";
import { Graph } from "../estructuras/graph/graph.js";
import { Vertex, VertexID } from "../estructuras/vertex.js";

const crearGrafo = () => {
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
    const e1 = new Edge<string>(A, B, 50, false, 0);
    const e2 = new Edge<string>(B, D, 40, false, 0);
    const e3 = new Edge<string>(A, G, 70, false, 0);
    const e4 = new Edge<string>(B, C, 20, false, 0);
    const e5 = new Edge<string>(C, D, 15, false, 0);
    const e6 = new Edge<string>(C, G, 12, false, 0);
    const e7 = new Edge<string>(F, D, 27, false, 0);
    const e8 = new Edge<string>(F, E, 10, false, 0);
    const e9 = new Edge<string>(D, E, 15, false, 0);
    const e10 = new Edge<string>(F, G, 30, false, 0);

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


    return graph;
}

export function kruskal_ejemplo() {
    const kruskal = new Kruskal(crearGrafo());

    console.log("¿Grafo conexo?", kruskal.isConnected());
    console.log("Peso total MST:", kruskal.getTotalWeight());
    console.log("Aristas del MST:");
    kruskal.getMSTEdges().forEach(e =>
        console.log(`  ${e.from.id} — ${e.to.id}: ${e.weight}`)
    );
    console.log("Camino A → E en MST:", kruskal.getPath(new VertexID("A"), new VertexID("E")).join(" → "));
}

export function prim_ejemplo() {
    const prim = new Prim(crearGrafo(), new VertexID("A"));
    
    console.log("¿Grafo conexo?", prim.isConnected());
    console.log("Peso total MST:", prim.getTotalWeight());
    prim.getMSTEdges().forEach(e =>
        console.log(`  ${e.from.id} — ${e.to.id}: ${e.weight}`)
    );
    console.log("Camino A → E:", prim.getPath(new VertexID("A"), new VertexID("E")).join(" → "));
}