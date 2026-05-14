import {ScheduleConstraint} from "./schedule-constraint.abstract.js";
import type {AsignacionResultado} from "../../models/resultado.model.js";

// No se puede cambiar de sede en bloques consecutivos (inmediatos)
export class NoImmediateSedeChangeConstraint extends ScheduleConstraint {
    name = "NoImmediateSedeChange";

    isSatisfied(
        candidate: AsignacionResultado,
        confirmed: AsignacionResultado[],
    ): boolean {
        const numCandidate = this.getNumeroBloque(candidate);

        return !confirmed.some(c => {
            const numC = this.getNumeroBloque(c);
            const esInmediato = Math.abs(numCandidate - numC) === 1;
            const sedeDiff = c.salonDetalle?.sede !== candidate.salonDetalle?.sede;
            return esInmediato && sedeDiff;
        });
    }
}