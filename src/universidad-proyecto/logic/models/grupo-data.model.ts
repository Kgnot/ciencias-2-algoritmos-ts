import type { SalonInput, TipoSalon, Carrera } from "./input-base.js";
import type { FranjaHoraria } from "./franja-horaria.js";

export interface GrupoData {
    materiaId: string;
    nombre: string;
    grupo: string;
    semestre: number;
    tipoSalon: TipoSalon;
    carrera: Carrera;
    creditos: number;        // 1-4 créditos
    franja: FranjaHoraria | null;
    salon: SalonInput | null;
    bloque: number;          // 0, 1, 2, 3 para materias de varios bloques
}