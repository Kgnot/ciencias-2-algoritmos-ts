import type {AsignacionResultado} from "../../models/resultado.model.js";
import {GlobalContext} from "../../global.context.js";
import type {GrupoData} from "../../models/grupo-data.model.js";
import type {Graph} from "../../../../estructuras/graph/graph.js";
import type {VertexID} from "../../../../estructuras/vertex.js";


// obtiene bloques disponibles
export class BlockCollector {
    private readonly globalContext = GlobalContext.getInstance();

    collect(materiasSet: Set<string>): AsignacionResultado[] {
        const graph: Graph<GrupoData> = this.globalContext.getGraph();
        const colorMap: Map<VertexID, string> = this.globalContext.getColorMap();

        const colorMapNorm = new Map<string, string>();
        for (const [vid, salon] of colorMap) colorMapNorm.set(vid, salon);

        const resultado: AsignacionResultado[] = [];

        for (const vertex of graph.getVertex()) {
            const data: GrupoData = vertex.getValue();
            if (!materiasSet.has(data.materiaId)) continue;
            if (!data.franja || !data.salon) continue;

            const salonID = colorMapNorm.get(vertex.id);
            if (!salonID) continue;

            resultado.push({
                grupo: `${data.materiaId}-G${data.grupo}`,
                materia: data.nombre,
                semestre: data.semestre,
                franja: data.franja.id,
                horario: `${data.franja.inicio}-${data.franja.fin}`,
                salon: salonID,
                salonDetalle: data.salon,
                tipoSalon: data.tipoSalon,
                capacidad: data.salon.capacidad,
                color: salonID,
            });
        }

        return resultado;
    }
}