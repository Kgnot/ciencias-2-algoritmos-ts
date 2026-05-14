import type {Graph} from "../../../../estructuras/graph/graph";
import type {GrupoData} from "../../models/grupo-data.model";
import {Edge} from "../../../../estructuras/edge";
import {Vertex} from "../../../../estructuras/vertex";

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

    static connectSameGroupSameDay(
        vertices: Vertex<GrupoData>[],
        graph: Graph<GrupoData>
    ): void {

        const groups = new Map<string, Vertex<GrupoData>[]>();

        // Agrupar por materia + grupo
        for (const v of vertices) {
            const data = v.getValue();
            const key = `${data.materiaId}-${data.grupo}`;

            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(v);
        }

        // Crear conflictos dentro del grupo
        for (const groupVertices of groups.values()) {
            for (let i = 0; i < groupVertices.length; i++) {
                for (let j = i + 1; j < groupVertices.length; j++) {

                    const v1 = groupVertices[i];
                    const v2 = groupVertices[j];

                    if (!v1 || !v2) continue;

                    const f1 = v1.getValue().franja;
                    const f2 = v2.getValue().franja;

                    if (!f1 || !f2) continue;


                    if (f1.dia === f2.dia) {
                        graph.addEdge(new Edge(v1, v2,1,false, 1));
                    }
                }
            }
        }
    }
}