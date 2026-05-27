"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAdjacencyList = toAdjacencyList;
function toAdjacencyList(graph) {
    var map = new Map();
    for (var _i = 0, _a = graph.getVertex(); _i < _a.length; _i++) {
        var v = _a[_i];
        map.set(v.id, []);
    }
    for (var _b = 0, _c = graph.getEdges(); _b < _c.length; _b++) {
        var e = _c[_b];
        map.get(e.from.id).push(e);
    }
    return map;
}
