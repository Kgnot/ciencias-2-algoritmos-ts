export type TipoSalon = "normal" | "laboratorio";
export type TipoFranja = "A" | "B";
export type Carrera = "Sistemas" | "Electronica" | "Industrial";


// en una realidad serpia VO no datos primitivos - y en ingles xd
export interface MateriaInput {
    id: string;
    nombre: string;
    semestre: number;
    creditos: number;  // 1-4 créditos
    grupos: number;
    tipo: TipoSalon;
    carrera: Carrera;
}

export interface SalonInput {
    id: string;
    tipo: TipoSalon;
    capacidad: number;
}

export interface FranjasInput {
    tipoA: number;
    tipoB: number;
}

export interface ScheduleInput {
    materias: MateriaInput[];
    salones: SalonInput[];
    franjas: FranjasInput;
}
