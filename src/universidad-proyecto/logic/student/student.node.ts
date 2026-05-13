import type {AsignacionResultado} from "../models/resultado.model.js";

export interface StudentNode {
    asignacion: AsignacionResultado | null;
    materiaId: string | null;
}