import {ScheduleConstraint} from "./schedule-constraint.abstract";
import type {AsignacionResultado} from "../../models/resultado.model";

// Si ya se eligió un grupo para una materia, solo aceptar ese grupo
export class ConsistentGroupConstraint extends ScheduleConstraint {
    name = "ConsistentGroup";

    isSatisfied(
        candidate: AsignacionResultado,
        _confirmed: AsignacionResultado[],
        grupoElegido: Map<string, string>,
    ): boolean {
        const materiaId = this.getMateriaId(candidate);
        if (!grupoElegido.has(materiaId)) return true;
        return grupoElegido.get(materiaId) === candidate.grupo;
    }
}