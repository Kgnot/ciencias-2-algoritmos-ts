"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Graph = void 0;
var edge_1 = require("../edge");
var Graph = /** @class */ (function () {
    function Graph(directed) {
        if (directed === void 0) { directed = false; }
        this.directed = directed;
        // el vertice es un mapa para acceder O(1) a vertices
        this.vertex = new Map();
        this.edges = [];
    }
    Graph.prototype.normalizeId = function (id) {
        return typeof id === "string" ? id : id;
    };
    Graph.prototype.addVertex = function (vertex) {
        var id = vertex.id;
        if (this.vertex.has(id)) {
            throw new Error("Vertex ".concat(id, " already exists"));
        }
        this.vertex.set(id, vertex);
    };
    Graph.prototype.addEdge = function (edge) {
        var fromId = edge.from.id;
        var toId = edge.to.id;
        if (!this.vertex.has(fromId) || !this.vertex.has(toId)) {
            throw new Error("Both vertices must exist in graph");
        }
        this.edges.push(edge);
        if (!this.directed && !edge.directed) {
            this.edges.push(new edge_1.Edge(edge.to, edge.from, edge.weight, false, edge.maxFlow));
        }
    };
    Graph.prototype.isDirected = function () {
        return this.directed;
    };
    Graph.prototype.getVertex = function () {
        return Array.from(this.vertex.values());
    };
    Graph.prototype.getEdges = function () {
        return __spreadArray([], this.edges, true);
    };
    Graph.prototype.getVertexById = function (id) {
        var key = this.normalizeId(id);
        var v = this.vertex.get(key);
        if (!v)
            throw new Error("Vertex ".concat(key, " not found"));
        return v;
    };
    Graph.prototype.getUniqueEdges = function () {
        var seen = new Set();
        return this.edges.filter(function (e) {
            var key = [e.from.id, e.to.id].sort().join('-');
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
    };
    Object.defineProperty(Graph.prototype, "vertexCount", {
        get: function () {
            return this.vertex.size;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Graph.prototype, "edgeCount", {
        get: function () {
            return this.edges.length;
        },
        enumerable: false,
        configurable: true
    });
    return Graph;
}());
exports.Graph = Graph;
