import type { MateriaInput } from "../../models/input-base.js";
import type { FranjaHoraria } from "../../models/franja-horaria.js";
import type { GrupoData } from "../../models/grupo-data.model.js";
import { Vertex} from "../../../../estructuras/vertex.js";


/*
*
* Clase estática que encapsula la creación de vértices del grafo.
* Su única responsabilidad es tomar los datos de una materia, grupo, bloque y franja, y construir el objeto Vertex<GrupoData> con su ID único.
* */
export class VertexFactory {
    static create(
        materia: MateriaInput,
        grupo: number,
        bloque: number,
        franja: FranjaHoraria
    ): Vertex<GrupoData> {
        const data: GrupoData = {
            materiaId: materia.id,
            nombre: `${materia.nombre} G${grupo}`,
            grupo: String(grupo),
            semestre: materia.semestre,
            tipoSalon: materia.tipo,
            carrera: materia.carrera,
            creditos: materia.creditos,
            franja: franja,
            salon: null,
            bloque: bloque,
        };

        const vertexId = `${materia.id}-G${grupo}-B${bloque}`;
        return new Vertex<GrupoData>(vertexId, data);
    }
}