import {DayConstraint, DayConstraintContext} from "../allocator-constraint.abstract";
import {MateriaInput} from "../../../../../models/input-base";
import {FranjaHoraria} from "../../../../../models/franja-horaria";


// [R2] Un mismo grupo no puede tener dos bloques el mismo día
export class NoRepeatedDayConstraint extends DayConstraint {
    name = "NoRepeatedDay [R2]";

    isSatisfied(
        day: string,
        _materia: MateriaInput,
        assigned: FranjaHoraria[],
        _ctx: DayConstraintContext,
    ): boolean {
        return !assigned.some(b => b.dia === day);
    }
}