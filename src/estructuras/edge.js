"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Edge = void 0;
var Edge = /** @class */ (function () {
    function Edge(from, to, weight, directed, maxFlow) {
        if (weight === void 0) { weight = 1; }
        if (directed === void 0) { directed = false; }
        this.from = from;
        this.to = to;
        this.weight = weight;
        this.directed = directed;
        this.maxFlow = maxFlow;
        this.from = from;
        this.to = to;
        this.weight = weight;
        this.directed = directed;
        this.tupleFlow = [0, maxFlow];
    }
    Edge.prototype.compareTo = function (other) {
        if (this.weight < other.weight)
            return -1;
        if (this.weight > other.weight)
            return 1;
        return 0;
    };
    Edge.prototype.getMaxFlow = function () {
        return this.tupleFlow[1];
    };
    Edge.prototype.getFlowGiven = function () {
        return this.tupleFlow[0];
    };
    Edge.prototype.setFlowGiven = function (value) {
        if (value < 0 || value > this.maxFlow) {
            throw new Error("Flow out of bounds");
        }
        this.tupleFlow = [value, this.maxFlow];
    };
    Edge.prototype.toString = function () {
        return "Edge(".concat(this.from.id, " -> ").concat(this.to.id, ", weight: ").concat(this.weight, ", directed: ").concat(this.directed, ")");
    };
    return Edge;
}());
exports.Edge = Edge;
