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
    profesor: string;
}

export interface SalonInput {
    id: string;
    tipo: TipoSalon;
    capacidad: number;
    piso: number;
    sede: string;
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

export interface Sede {
    id: string;
}