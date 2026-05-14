import type {ScheduleConstraint} from "./schedule-constraint.abstract";
import type {AsignacionResultado} from "../../models/resultado.model";

export class ConstraintChecker {
    constructor(private readonly constraints: ScheduleConstraint[]) {}

    check(
        candidate: AsignacionResultado,
        confirmed: AsignacionResultado[],
        grupoElegido: Map<string, string>,
    ): { passes: boolean; failedConstraint?: string } {
        for (const constraint of this.constraints) {
            if (!constraint.isSatisfied(candidate, confirmed, grupoElegido)) {
                return {passes: false, failedConstraint: constraint.name};
            }
        }
        return {passes: true};
    }
}