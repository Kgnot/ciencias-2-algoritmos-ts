"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphIndexer = void 0;
var GraphIndexer = /** @class */ (function () {
    function GraphIndexer(vertices) {
        var _this = this;
        this.indexMap = new Map();
        this.reverseMap = [];
        vertices.forEach(function (v, i) {
            _this.indexMap.set(v.id.value, i);
            _this.reverseMap[i] = v;
        });
    }
    GraphIndexer.prototype.getIndex = function (id) {
        var key = typeof id === "string" ? id : id.value;
        var idx = this.indexMap.get(key);
        if (idx === undefined)
            throw new Error("Vertex not indexed");
        return idx;
    };
    GraphIndexer.prototype.getVertex = function (index) {
        if (this.reverseMap[index] === undefined)
            throw new Error("Index out of bounds");
        return this.reverseMap[index];
    };
    GraphIndexer.prototype.size = function () {
        return this.reverseMap.length;
    };
    return GraphIndexer;
}());
exports.GraphIndexer = GraphIndexer;
