import {DayConstraint, type DayConstraintContext} from "../allocator-constraint.abstract.js";
import {MateriaInput} from "../../../../../models/input-base";
import {FranjaHoraria} from "../../../../../models/franja-horaria";

// [R3] Materias 3+ créditos: no días consecutivos
export class NoConsecutiveDayConstraint extends DayConstraint {
    name = "NoConsecutiveDay [R3]";

    isSatisfied(
        day: string,
        materia: MateriaInput,
        assigned: FranjaHoraria[],
        ctx: DayConstraintContext,
    ): boolean {
        if (materia.creditos != 3) return true;

        const idx = ctx.days.indexOf(day);
        return !assigned.some(b => {
            const bIdx = ctx.days.indexOf(b.dia);
            return Math.abs(idx - bIdx) === 1;
        });
    }
}