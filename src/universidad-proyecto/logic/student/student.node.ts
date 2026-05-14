import type {AsignacionResultado} from "../models/resultado.model";

export interface StudentNode {
    asignacion: AsignacionResultado | null;
    materiaId: string | null;
}