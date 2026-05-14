import {DayConstraint, type DayConstraintContext} from "../allocator-constraint.abstract.js";
import {FranjaHoraria} from "../../../../../models/franja-horaria";
import {MateriaInput} from "../../../../../models/input-base";


// [R8] No saturar días con materias pesadas del mismo semestre+carrera
export class NoHeavyDaySaturationConstraint extends DayConstraint {
    name = "NoHeavyDaySaturation [R8]";

    isSatisfied(
        day: string,
        materia: MateriaInput,
        _assigned: FranjaHoraria[],
        ctx: DayConstraintContext,
    ): boolean {
        if (materia.creditos < 3) return true;

        const key = `${materia.semestre}-${materia.carrera}-${day}`;
        const count = ctx.heavyPerDayCounter.get(key) ?? 0;
        return count < ctx.heavyDayLimit;
    }
}