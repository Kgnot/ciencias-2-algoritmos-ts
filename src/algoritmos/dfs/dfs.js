"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DFS = void 0;
var adjacency_list_1 = require("../../estructuras/proyeccion/adjacency_list");
var DFS = /** @class */ (function () {
    function DFS(graph) {
        this.graph = graph;
        this.visited = new Set();
        this.parent = new Map(); // representamos el padre de cada nodo (id) que puede ser nulo
        this.adjacencyList = (0, adjacency_list_1.toAdjacencyList)(graph);
    }
    // para ejecutar necesitamos un inicial, obligaremos a esto
    DFS.prototype.execute = function (startVertexId, edgeFilter) {
        var vertices = this.graph.getVertex();
        // iniciamos todos los padres null
        for (var _i = 0, vertices_1 = vertices; _i < vertices_1.length; _i++) {
            var vertex = vertices_1[_i];
            this.parent.set(vertex.id, null);
        }
        var startVertex = this.graph.getVertexById(startVertexId);
        this._loop(startVertex, edgeFilter);
    };
    DFS.prototype._loop = function (vertex, edgeFilter) {
        // marcamos el vértice como visitado:
        this.visited.add(vertex.id);
        //obtenemos los vertices adyacentes
        var adjacentEdges = this.adjacencyList.get(vertex.id) || [];
        // e iteramos xd
        for (var _i = 0, adjacentEdges_1 = adjacentEdges; _i < adjacentEdges_1.length; _i++) {
            var edge = adjacentEdges_1[_i];
            var allowed = edgeFilter ? edgeFilter(edge) : true;
            if (!this.visited.has(edge.to.id) && allowed) {
                this.parent.set(edge.to.id, vertex.id); // establecemos el padre del nodo adyacente
                console.log(this.parent.get(edge.to.id), "->", edge.to.id);
                this._loop(edge.to, edgeFilter); // y seguimos con el nodo adyacente
            }
        }
    };
    DFS.prototype.getPath = function (fromId, toId) {
        if (!this.visited.has(toId)) {
            return []; // el destino no fue visitado
        }
        var path = [];
        var current = toId;
        // y vamos a recontruir  el camino desde el destino al inicio:
        while (current) {
            path.unshift(current); // agregamos al inicio
            current = this.parent.get(current) || null;
        }
        //verificamos si el camino camienza desde el nodo inicial
        if (path[0] === fromId) {
            return path;
        }
        return []; // no hay camino directo
    };
    // obtener el parentMap:
    DFS.prototype.getParentMap = function () {
        return new Map(this.parent);
    };
    // y como árbol:
    DFS.prototype.getDFSTree = function () {
        var tree = {};
        for (var _i = 0, _a = this.parent.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], child = _b[0], parent_1 = _b[1];
            tree[child] = parent_1 ? parent_1 : "raíz";
        }
        return tree;
    };
    DFS.prototype.reset = function () {
        this.visited.clear();
        this.parent.clear();
        this.adjacencyList = (0, adjacency_list_1.toAdjacencyList)(this.graph); // reconstruimos la lista de adyacencia por si el grafo cambió
        console.log("DFS reset: visited cleared, parent map cleared, adjacency list rebuilt.");
    };
    DFS.prototype.getVisited = function () {
        return Array.from(this.visited);
    };
    DFS.prototype.setAdjacencyList = function (map) {
        this.adjacencyList = map;
    };
    return DFS;
}());
exports.DFS = DFS;
