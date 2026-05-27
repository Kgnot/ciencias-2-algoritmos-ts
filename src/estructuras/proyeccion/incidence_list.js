"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toIncidenceList = toIncidenceList;
exports.toUndirectedAdjacency = toUndirectedAdjacency;
var edge_1 = require("../edge");
var adjacency_list_1 = require("./adjacency_list");
function toIncidenceList(graph) {
    var map = new Map();
    for (var _i = 0, _a = graph.getVertex(); _i < _a.length; _i++) {
        var v = _a[_i];
        map.set(v.id, []);
    }
    for (var _b = 0, _c = graph.getEdges(); _b < _c.length; _b++) {
        var edge = _c[_b];
        map.get(edge.from.id).push(edge);
        map.get(edge.to.id).push(edge);
    }
    return map;
}
function toUndirectedAdjacency(graph) {
    var _a, _b, _c;
    var baseAdjacency = (0, adjacency_list_1.toAdjacencyList)(graph);
    var normalized = new Map();
    for (var _i = 0, _d = graph.getVertex(); _i < _d.length; _i++) {
        var v = _d[_i];
        normalized.set(v.id, []);
    }
    for (var _e = 0, _f = graph.getUniqueEdges(); _e < _f.length; _e++) {
        var e = _f[_e];
        (_a = normalized.get(e.from.id)) === null || _a === void 0 ? void 0 : _a.push(e);
        (_b = normalized.get(e.to.id)) === null || _b === void 0 ? void 0 : _b.push(new edge_1.Edge(e.to, e.from, e.weight, false, e.maxFlow));
    }
    // En caso de grafos dirigidos, preserva las salidas que ya existan en la lista estable.
    if (graph.directed) {
        for (var _g = 0, _h = baseAdjacency.entries(); _g < _h.length; _g++) {
            var _j = _h[_g], id = _j[0], edges = _j[1];
            for (var _k = 0, edges_1 = edges; _k < edges_1.length; _k++) {
                var edge = edges_1[_k];
                (_c = normalized.get(id)) === null || _c === void 0 ? void 0 : _c.push(edge);
            }
        }
    }
    return normalized;
}
