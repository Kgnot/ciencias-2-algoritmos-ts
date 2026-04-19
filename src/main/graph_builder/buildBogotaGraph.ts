import { Edge } from "../../estructuras/edge.js";
import { Graph } from "../../estructuras/graph/graph.js";
import { Vertex } from "../../estructuras/vertex.js";
import type { NodeData } from "../entity/Data.js";
import type { RawStop } from "../entity/RawStop.js";
import type { RawTouristSite } from "../entity/RawTouristSite.js";
import type { RawTransition } from "../entity/RawTransition.js";
import type { BogotaGraph } from "./BogotaGraph.js";
import { findNearestStops } from "../geo/geo.js";

export interface BuildGraphOptions {
  maxWalkMin?: number;
  nearestStopsPerSite?: number;
}

export class BogotaGraphBuilder {
  constructor(private readonly options: BuildGraphOptions = {}) {}

  build(
    stops: RawStop[],
    transitions: RawTransition[],
    sites: RawTouristSite[]
  ): BogotaGraph {
    const maxWalkMin = this.options.maxWalkMin ?? 20;
    const nearestStopsPerSite = this.options.nearestStopsPerSite ?? 3;

    const graph = new Graph<NodeData>(true);
    const stopVertexIds: string[] = [];
    const siteVertexIds: string[] = [];

    const stopVertexByStopId = new Map<string, Vertex<NodeData>>();

    for (const stop of stops) {
      const vertexId = `stop:${stop.stopId}`;
      const stopVertex = new Vertex<NodeData>(vertexId, {
        kind: "stop",
        stopId: stop.stopId,
        stopName: stop.stopName,
        stopLat: stop.stopLat,
        stopLon: stop.stopLon,
      });
      graph.addVertex(stopVertex);
      stopVertexIds.push(vertexId);
      stopVertexByStopId.set(stop.stopId, stopVertex);
    }

    for (const site of sites) {
      const vertexId = `site:${site.id}`;
      const siteVertex = new Vertex<NodeData>(vertexId, {
        kind: "site",
        siteId: site.id,
        name: site.name,
        lat: site.lat,
        lng: site.lng,
        visitDurationMin: site.visitDurationMin,
        openingTimeMin: site.openingTimeMin,
        closingTimeMin: site.closingTimeMin,
        category: site.category,
      });
      graph.addVertex(siteVertex);
      siteVertexIds.push(vertexId);
    }

    for (const transition of transitions) {
      const from = stopVertexByStopId.get(transition.fromStopId);
      const to = stopVertexByStopId.get(transition.toStopId);
      if (!from || !to) {
        continue;
      }
      graph.addEdge(new Edge(from, to, transition.travelTimeMin, true));
    }

    for (const site of sites) {
      const siteVertex = graph.getVertexById(`site:${site.id}`);
      const nearestStops = findNearestStops(
        site.lat,
        site.lng,
        stops,
        maxWalkMin,
        nearestStopsPerSite
      );

      for (const nearest of nearestStops) {
        const stopVertex = stopVertexByStopId.get(nearest.stopId);
        if (!stopVertex) {
          continue;
        }

        graph.addEdge(new Edge(siteVertex, stopVertex, nearest.walkMin, true));
        graph.addEdge(new Edge(stopVertex, siteVertex, nearest.walkMin, true));
      }
    }

    return {
      graph,
      siteVertexIds,
      stopVertexIds,
    };
  }
}
