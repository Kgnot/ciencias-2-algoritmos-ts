import type { BogotaGraph } from "../graph_builder/BogotaGraph.js";
import type { NodeData } from "../entity/Data.js";

export interface GraphVertexDto {
  id: string;
  data: NodeData;
}

export interface GraphEdgeDto {
  from: string;
  to: string;
  weight: number;
  directed: boolean;
}

export interface GraphSnapshotDto {
  summary: {
    totalVertices: number;
    totalEdges: number;
    stopVertices: number;
    siteVertices: number;
  };
  vertices: GraphVertexDto[];
  edges: GraphEdgeDto[];
}

export class GraphSerializer {
  serialize(graphData: BogotaGraph): GraphSnapshotDto {
    const vertices = graphData.graph.getVertex().map((vertex) => ({
      id: vertex.id,
      data: vertex.getValue(),
    }));

    const edges = graphData.graph.getEdges().map((edge) => ({
      from: edge.from.id,
      to: edge.to.id,
      weight: edge.weight,
      directed: edge.directed,
    }));

    return {
      summary: {
        totalVertices: graphData.graph.vertexCount,
        totalEdges: graphData.graph.edgeCount,
        stopVertices: graphData.stopVertexIds.length,
        siteVertices: graphData.siteVertexIds.length,
      },
      vertices,
      edges,
    };
  }
}
