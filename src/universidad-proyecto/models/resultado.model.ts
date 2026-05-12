import type {TipoSalon} from "./input-base.js";

export interface AsignacionResultado {
    grupo: string;
    materia: string;
    semestre: number;
    franja: string;
    horario: string;
    salon: string;
    tipoSalon: TipoSalon;
    capacidad: number;
    color: string; // Id del salon
}


export interface ScheduleOutput {
    algoritmo: string;
    numeroCromatico: number;   // colores usados = salones distintos necesarios
    salonesUsados: number;
    totalGrupos: number;
    asignaciones: AsignacionResultado[];
}
