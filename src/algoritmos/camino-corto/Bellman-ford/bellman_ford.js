"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BellmanFord = void 0;
var BellmanFord = /** @class */ (function () {
    function BellmanFord(graph, startId) {
        this.vertices = graph.getVertex();
        this.edges = graph.getEdges();
        this.distances = new Map();
        this.previous = new Map();
        this.initialize(startId);
        this.run();
        this.detectNegativeCycle();
    }
    // ------------------------
    // Inicialización
    // ------------------------
    BellmanFord.prototype.initialize = function (startId) {
        for (var _i = 0, _a = this.vertices; _i < _a.length; _i++) {
            var v = _a[_i];
            this.distances.set(v.id, Infinity);
            this.previous.set(v.id, null);
        }
        this.distances.set(startId, 0);
    };
    // ------------------------
    // Algoritmo principal
    // ------------------------
    BellmanFord.prototype.run = function () {
        var n = this.vertices.length;
        // Relajamos las aristas V-1 veces
        for (var i = 0; i < n - 1; i++) {
            var relaxed = false; // optimización: si no hay cambios, terminamos temprano
            for (var _i = 0, _a = this.edges; _i < _a.length; _i++) {
                var edge = _a[_i];
                var fromId = edge.from.id;
                var toId = edge.to.id;
                var distFrom = this.distances.get(fromId);
                // Saltamos si el origen no ha sido alcanzado todavía
                if (distFrom === Infinity)
                    continue;
                var newDist = distFrom + edge.weight;
                var currentDist = this.distances.get(toId);
                if (newDist < currentDist) {
                    this.distances.set(toId, newDist);
                    this.previous.set(toId, fromId);
                    relaxed = true;
                }
            }
            // Si no hubo relajaciones, terminamos temprano
            if (!relaxed)
                break;
        }
    };
    // ------------------------
    // Detección de ciclos negativos
    // ------------------------
    BellmanFord.prototype.detectNegativeCycle = function () {
        for (var _i = 0, _a = this.edges; _i < _a.length; _i++) {
            var edge = _a[_i];
            var fromId = edge.from.id;
            var toId = edge.to.id;
            var distFrom = this.distances.get(fromId);
            if (distFrom === Infinity)
                continue;
            if (distFrom + edge.weight < this.distances.get(toId)) {
                throw new Error("Negative weight cycle detected");
            }
        }
    };
    // ------------------------
    // API pública
    // ------------------------
    BellmanFord.prototype.getDistance = function (toId) {
        var distance = this.distances.get(toId);
        if (distance === undefined)
            return Infinity;
        return distance;
    };
    BellmanFord.prototype.getPath = function (toId) {
        var _a;
        var path = [];
        var current = toId;
        while (current !== null) {
            path.unshift(current);
            current = (_a = this.previous.get(current)) !== null && _a !== void 0 ? _a : null;
        }
        return path;
    };
    BellmanFord.prototype.getAllDistances = function () {
        return new Map(this.distances);
    };
    BellmanFord.prototype.getPrevious = function () {
        return new Map(this.previous);
    };
    BellmanFord.prototype.hasPath = function (toId) {
        return this.distances.get(toId) !== Infinity;
    };
    return BellmanFord;
}());
exports.BellmanFord = BellmanFord;
