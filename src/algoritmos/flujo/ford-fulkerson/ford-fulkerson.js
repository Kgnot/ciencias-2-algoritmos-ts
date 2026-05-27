"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FordFulkerson = void 0;
var dfs_1 = require("../../dfs/dfs");
var adjacency_matrix_1 = require("../../../estructuras/proyeccion/adjacency_matrix");
var FordFulkerson = /** @class */ (function () {
    function FordFulkerson(graph) {
        this.graph = graph;
        this.dfs = new dfs_1.DFS(graph);
        var _a = (0, adjacency_matrix_1.toAdjacencyMatrix)(graph, true), matrix = _a.matrix, indexer = _a.indexer;
        this.residualMatrix = matrix;
        this.indexer = indexer;
    }
    FordFulkerson.prototype._getResidualCapacity = function (fromId, toId) {
        var i = this.indexer.getIndex(fromId);
        var j = this.indexer.getIndex(toId);
        return this.residualMatrix[i][j];
    };
    FordFulkerson.prototype._setResidualCapacity = function (fromId, toId, value) {
        var i = this.indexer.getIndex(fromId);
        var j = this.indexer.getIndex(toId);
        this.residualMatrix[i][j] = value;
    };
    FordFulkerson.prototype.execute = function (sourceId, sinkId) {
        var _this = this;
        var maxFlow = 0;
        var residualFilter = function (edge) {
            return _this._getResidualCapacity(edge.from.id, edge.to.id) > 0;
        };
        this.dfs.reset();
        this.dfs.execute(sourceId, residualFilter);
        var path = this.dfs.getPath(sourceId, sinkId);
        while (path.length > 0) {
            // bottleneck
            var pathFlow = Infinity;
            for (var i = 0; i < path.length - 1; i++) {
                var cap = this._getResidualCapacity(path[i], path[i + 1]);
                pathFlow = Math.min(pathFlow, cap);
            }
            // actualizar matriz residual
            for (var i = 0; i < path.length - 1; i++) {
                var u = path[i];
                var v = path[i + 1];
                this._setResidualCapacity(u, v, this._getResidualCapacity(u, v) - pathFlow);
                this._setResidualCapacity(v, u, this._getResidualCapacity(v, u) + pathFlow);
            }
            maxFlow += pathFlow;
            this.dfs.reset();
            this.dfs.execute(sourceId, residualFilter);
            path = this.dfs.getPath(sourceId, sinkId);
        }
        return maxFlow;
    };
    return FordFulkerson;
}());
exports.FordFulkerson = FordFulkerson;
