import type {SalonInput, TipoSalon} from "./input-base";

export interface AsignacionResultado {
    grupo: string;
    materia: string;
    semestre: number;
    franja: string;
    horario: string;
    salon: string;
    salonDetalle: SalonInput | null;
    tipoSalon: TipoSalon;
    capacidad: number;
    color: string; // Id del salon
}

