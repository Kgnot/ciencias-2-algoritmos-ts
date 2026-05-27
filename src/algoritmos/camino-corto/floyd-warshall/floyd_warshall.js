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
exports.FloydWarshall = void 0;
var adjacency_matrix_1 = require("../../../estructuras/proyeccion/adjacency_matrix");
var FloydWarshall = /** @class */ (function () {
    function FloydWarshall(graph) {
        var _a = (0, adjacency_matrix_1.toAdjacencyMatrix)(graph, false), matrix = _a.matrix, indexer = _a.indexer;
        this.dist = matrix.map(function (row) { return __spreadArray([], row, true); });
        this.indexer = indexer;
        var n = matrix.length;
        this.next = Array.from({ length: n }, function () {
            return Array(n).fill(null);
        });
        this.initializeNext();
        this.run();
        this.detectNegativeCycle();
    }
    // ------------------------
    // Inicialización
    // ------------------------
    FloydWarshall.prototype.initializeNext = function () {
        var n = this.dist.length;
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                if (i !== j && this.dist[i][j] !== Infinity) {
                    this.next[i][j] = j;
                }
            }
        }
    };
    // ------------------------
    // Algoritmo principal
    // ------------------------
    FloydWarshall.prototype.run = function () {
        var n = this.dist.length;
        for (var k = 0; k < n; k++) {
            for (var i = 0; i < n; i++) {
                for (var j = 0; j < n; j++) {
                    var newDist = this.dist[i][k] + this.dist[k][j];
                    if (newDist < this.dist[i][j]) {
                        this.dist[i][j] = newDist;
                        this.next[i][j] = this.next[i][k];
                    }
                }
            }
        }
    };
    // ------------------------
    // Ciclos negativos
    // ------------------------
    FloydWarshall.prototype.detectNegativeCycle = function () {
        var n = this.dist.length;
        for (var i = 0; i < n; i++) {
            if (this.dist[i][i] < 0) {
                throw new Error("Negative cycle detected");
            }
        }
    };
    // ------------------------
    // API pública
    // ------------------------
    FloydWarshall.prototype.getDistance = function (fromId, toId) {
        var i = this.indexer.getIndex(fromId);
        var j = this.indexer.getIndex(toId);
        return this.dist[i][j];
    };
    FloydWarshall.prototype.getPath = function (fromId, toId) {
        var i = this.indexer.getIndex(fromId);
        var j = this.indexer.getIndex(toId);
        if (this.next[i][j] === null)
            return [];
        var path = [fromId];
        var current = i;
        while (current !== j) {
            current = this.next[current][j];
            path.push(this.indexer.getVertex(current).id);
        }
        return path;
    };
    FloydWarshall.prototype.getAllDistances = function () {
        return this.dist.map(function (row) { return __spreadArray([], row, true); });
    };
    return FloydWarshall;
}());
exports.FloydWarshall = FloydWarshall;
