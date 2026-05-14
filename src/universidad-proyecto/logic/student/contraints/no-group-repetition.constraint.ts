import {ScheduleConstraint} from "./schedule-constraint.abstract";
import type {AsignacionResultado} from "../../models/resultado.model";

// Un mismo grupo no puede aparecer dos veces en el mismo día
export class NoGroupRepetitionConstraint extends ScheduleConstraint {
    name = "NoGroupRepetition";

    isSatisfied(
        candidate: AsignacionResultado,
        confirmed: AsignacionResultado[],
    ): boolean {
        return !confirmed.some(c => c.grupo === candidate.grupo);
    }
}