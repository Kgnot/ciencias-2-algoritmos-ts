import type {Graph} from "../../../estructuras/graph/graph";
import type {GrupoData} from "../models/grupo-data.model";
import type {DiaSemana} from "../models/franja-horaria";
import type {SalonInput} from "../models/input-base";
import {ScheduleSolver, type AlgorithmFactory} from "./schedule-solver";

export interface HorarioClase {
    vertexId: string;
    materia: string;
    grupo: string;
    dia: DiaSemana;
    horaInicio: string;
    horaFin: string;
    salon: string;
    salonDetalle: SalonInput | null;
    tipo: string;
    bloque: number;
}

export type HorarioSemanal = Record<string, Record<string, HorarioClase[]>>;

export class ScheduleBuilder {

    constructor(
        private readonly graph: Graph<GrupoData>,
        private readonly salones: SalonInput[],
    ) {
    }

    public buildHorario(algorithmFactory: AlgorithmFactory): HorarioSemanal {
        const solver = new ScheduleSolver(this.graph, this.salones, algorithmFactory);
        const salonMap = solver.execute();
        const salonById = new Map(this.salones.map(salon => [salon.id, salon] as const));

        const horario = {} as HorarioSemanal;
        for (const dia of ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as DiaSemana[]) {
            horario[dia] = {};
        }

        for (const vertex of this.graph.getVertex()) {
            const data = vertex.getValue();
            const franja = data.franja;
            if (!franja) continue;

            const salonId = salonMap.get(vertex.id) ?? "Sin asignar";
            const salonDetalle = salonById.get(salonId);
            const horaKey = `${franja.inicio}-${franja.fin}`;
            const dia = franja.dia;

            if (!horario[dia]) horario[dia] = {};
            if (!horario[dia]![horaKey]) horario[dia]![horaKey] = [];

            horario[dia]![horaKey]!.push({
                vertexId: vertex.id,
                materia: data.nombre,
                grupo: data.grupo,
                dia,
                horaInicio: franja.inicio,
                horaFin: franja.fin,
                salon: salonId,
                salonDetalle: salonDetalle ?? null,
                tipo: data.tipoSalon,
                bloque: data.bloque,
            });
        }

        // Ordenar franjas por hora dentro de cada día
        for (const dia of Object.keys(horario)) {
            const diaObj = horario[dia];
            if (!diaObj) continue;
            const ordenado: Record<string, HorarioClase[]> = {};
            for (const hora of Object.keys(diaObj).sort()) {
                ordenado[hora] = diaObj[hora]!;
            }
            horario[dia] = ordenado;
        }

        return horario;
    }
}