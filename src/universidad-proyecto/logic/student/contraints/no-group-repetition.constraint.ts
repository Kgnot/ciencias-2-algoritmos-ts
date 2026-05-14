import {ScheduleConstraint} from "./schedule-constraint.abstract.js";
import type {AsignacionResultado} from "../../models/resultado.model.js";

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