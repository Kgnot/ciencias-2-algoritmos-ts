// received from POST request
import type { DiaSemana } from "../models/franja-horaria";
import type { TipoSalon } from "../models/input-base";

export interface StudentScheduleRequest {
    estudianteId: string;
    materias: string[]; // Materia IDs: ["SIS-ALG", "SIS-BD1", ...]
}

// block assigned to the student
export interface BloqueEstudiante {
    materiaId: string;
    nombreMateria: string;
    grupo: string;
    dia: DiaSemana;
    horaInicio: string;
    horaFin: string;
    salon: string;
    sede: string;        // Campus: "A", "B", "C"
    piso: number;
    tipoSalon: TipoSalon;
    bloque: number;
}

// response
export interface StudentScheduleResponse {
    estudianteId: string;
    bloques: BloqueEstudiante[];
    metricas: {
        totalBloques: number;
        cambiosDeSede: number;       // edges with weight 1 in the graph
        costoTotal: number;          // sum of path weights (Dijkstra)
        sedesUsadas: string[];       // campuses used
        materiasNoAsignadas: string[]; // materias without available slot
    };
}