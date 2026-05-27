"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAdjacencyMatrix = toAdjacencyMatrix;
var graph_indexer_1 = require("../graph/graph_indexer");
function toAdjacencyMatrix(graph, useFlow) {
    var vertices = graph.getVertex();
    var indexer = new graph_indexer_1.GraphIndexer(vertices);
    var size = indexer.size();
    var matrix = Array.from({ length: size }, function () {
        return Array(size).fill(0);
    });
    // diagonal en 0
    for (var i = 0; i < size; i++) {
        matrix[i][i] = 0;
    }
    for (var _i = 0, _a = graph.getEdges(); _i < _a.length; _i++) {
        var edge = _a[_i];
        var i = indexer.getIndex(edge.from.id.value);
        var j = indexer.getIndex(edge.to.id.value);
        matrix[i][j] = useFlow ? edge.getMaxFlow() : edge.weight;
    }
    return { matrix: matrix, indexer: indexer };
}
