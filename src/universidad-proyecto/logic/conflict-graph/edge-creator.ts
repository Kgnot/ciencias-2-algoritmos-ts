import type { Graph } from "../../../estructuras/graph/graph.js";
import type { GrupoData } from "../../models/grupo-data.model.js";
import { Edge } from "../../../estructuras/edge.js";
import { Vertex } from "../../../estructuras/vertex.js";

/*
* Clase estática que construye las aristas del grafo de conflictos.
* Agrupa los vértices por franja horaria y conecta todos contra todos dentro del mismo grupo, creando un grafo completo (clique) por cada franja.
* Esto garantiza que dos clases en la misma franja nunca compartan el mismo salón.
* */
export class EdgeCreator {
    static createCompleteGraph(vertices: Vertex<GrupoData>[], graph: Graph<GrupoData>): void {
        for (let i = 0; i < vertices.length; i++) {
            for (let j = i + 1; j < vertices.length; j++) {
                const a = vertices[i]!.getValue();
                const b = vertices[j]!.getValue();

                // Same materia, same group → different blocks (already on different days)
                if (a.materiaId === b.materiaId && a.grupo === b.grupo) continue;

                graph.addEdge(new Edge(vertices[i]!, vertices[j]!, 1, false, 1));
            }
        }
    }

    static connectByFranja(
        vertices: Vertex<GrupoData>[],
        graph: Graph<GrupoData>
    ): void {
        const bySlot = new Map<string, Vertex<GrupoData>[]>();

        for (const v of vertices) {
            const slotId = v.getValue().franja!.id;
            if (!bySlot.has(slotId)) bySlot.set(slotId, []);
            bySlot.get(slotId)!.push(v);
        }

        for (const slotVertices of bySlot.values()) {
            this.createCompleteGraph(slotVertices, graph);
        }
    }
}