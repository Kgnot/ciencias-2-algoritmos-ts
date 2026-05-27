"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dijkstra = void 0;
var adjacency_list_1 = require("../../../estructuras/proyeccion/adjacency_list");
var Dijkstra = /** @class */ (function () {
    function Dijkstra(graph, startId) {
        // Convertir grafo a lista de adyacencia
        this.adjList = (0, adjacency_list_1.toAdjacencyList)(graph);
        this.startId = startId;
        this.distances = new Map();
        this.previous = new Map();
        this.visited = new Set();
        this.initialize();
        this.run();
    }
    // ------------------------
    // Inicialización
    // ------------------------
    Dijkstra.prototype.initialize = function () {
        for (var _i = 0, _a = this.adjList.keys(); _i < _a.length; _i++) {
            var vertex = _a[_i];
            this.distances.set(vertex, Infinity);
            this.previous.set(vertex, null);
        }
        this.distances.set(this.startId, 0);
    };
    // ------------------------
    // Algoritmo principal
    // ------------------------
    Dijkstra.prototype.run = function () {
        // Cola de prioridad simulada con array de tuplas [vértice, distancia]
        var queue = [[this.startId, 0]];
        while (queue.length > 0) {
            // Ordenar para simular cola de prioridad (menor distancia primero)
            queue.sort(function (a, b) { return a[1] - b[1]; });
            var current = queue.shift()[0];
            // Si ya visitamos este vértice, lo saltamos
            if (this.visited.has(current))
                continue;
            // Marcamos como visitado
            this.visited.add(current);
            // Obtenemos los vecinos del vértice actual
            var neighbors = this.adjList.get(current) || [];
            for (var _i = 0, neighbors_1 = neighbors; _i < neighbors_1.length; _i++) {
                var edge = neighbors_1[_i];
                var neighbor = edge.to.id;
                var newDist = this.distances.get(current) + edge.weight;
                // Si encontramos una distancia mejor, actualizamos
                if (newDist < this.distances.get(neighbor)) {
                    this.distances.set(neighbor, newDist);
                    this.previous.set(neighbor, current);
                    queue.push([neighbor, newDist]);
                }
            }
        }
    };
    // ------------------------
    // Con early stop (para un destino específico)
    // ------------------------
    Dijkstra.prototype.runWithEarlyStop = function (targetId) {
        var queue = [[this.startId, 0]];
        while (queue.length > 0) {
            queue.sort(function (a, b) { return a[1] - b[1]; });
            var current = queue.shift()[0];
            if (this.visited.has(current))
                continue;
            this.visited.add(current);
            // Early stop: llegamos al destino
            if (current === targetId)
                break;
            var neighbors = this.adjList.get(current) || [];
            for (var _i = 0, neighbors_2 = neighbors; _i < neighbors_2.length; _i++) {
                var edge = neighbors_2[_i];
                var neighbor = edge.to.id;
                var newDist = this.distances.get(current) + edge.weight;
                if (newDist < this.distances.get(neighbor)) {
                    this.distances.set(neighbor, newDist);
                    this.previous.set(neighbor, current);
                    queue.push([neighbor, newDist]);
                }
            }
        }
    };
    // ------------------------
    // Construcción de camino
    // ------------------------
    Dijkstra.prototype.buildPath = function (targetId) {
        var _a;
        var path = [];
        var current = targetId;
        while (current !== null) {
            path.unshift(current);
            current = (_a = this.previous.get(current)) !== null && _a !== void 0 ? _a : null;
        }
        // Si el primer elemento no es el start, no hay camino
        if (path[0] !== this.startId)
            return [];
        return path;
    };
    // ------------------------
    // API pública
    // ------------------------
    // Obtener distancia a un vértice específico
    Dijkstra.prototype.getDistance = function (toId) {
        var distance = this.distances.get(toId);
        return distance !== undefined ? distance : Infinity;
    };
    // Obtener camino a un vértice específico
    Dijkstra.prototype.getPath = function (toId) {
        return this.buildPath(toId);
    };
    // Verificar si hay camino a un vértice
    Dijkstra.prototype.hasPath = function (toId) {
        return this.distances.get(toId) !== Infinity;
    };
    // Obtener todas las distancias
    Dijkstra.prototype.getAllDistances = function () {
        return new Map(this.distances);
    };
    // Obtener el vértice anterior a cada uno
    Dijkstra.prototype.getAllPrevious = function () {
        return new Map(this.previous);
    };
    // Versión con early stop (para optimizar cuando solo interesa un destino)
    Dijkstra.findPath = function (graph, startId, targetId) {
        var dijkstra = new Dijkstra(graph, startId);
        // Ejecutar con early stop
        dijkstra.runWithEarlyStop(targetId);
        return {
            distance: dijkstra.getDistance(targetId),
            path: dijkstra.getPath(targetId)
        };
    };
    return Dijkstra;
}());
exports.Dijkstra = Dijkstra;
