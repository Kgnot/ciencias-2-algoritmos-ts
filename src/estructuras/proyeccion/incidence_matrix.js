"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toIncidenceMatrix = toIncidenceMatrix;
var graph_indexer_1 = require("../graph/graph_indexer");
function toIncidenceMatrix(graph) {
    var vertices = graph.getVertex();
    var edges = graph.getEdges();
    var indexer = new graph_indexer_1.GraphIndexer(vertices);
    var matrix = Array.from({ length: vertices.length }, function () { return Array(edges.length).fill(0); });
    edges.forEach(function (edge, idx) {
        // obtemoes los indices de los vertices de origen y destino
        var from = indexer.getIndex(edge.from.id.value);
        var to = indexer.getIndex(edge.to.id.value);
        if (graph.directed) {
            matrix[from][idx] = -edge.weight; // salida
            matrix[to][idx] = edge.weight; // entrada
        }
        else {
            matrix[from][idx] = edge.weight; // incidencia
            matrix[to][idx] = edge.weight; // incidencia
        }
    });
    return { matrix: matrix, indexer: indexer };
}
