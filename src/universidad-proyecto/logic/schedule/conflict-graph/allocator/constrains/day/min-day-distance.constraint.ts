import {DayConstraint, type DayConstraintContext} from "../allocator-constraint.abstract.js";
import {MateriaInput} from "../../../../../models/input-base";
import {FranjaHoraria} from "../../../../../models/franja-horaria";


const MIN_DISTANCE = 1;

// [R5] Materias 4 créditos: distancia mínima de 2 días entre bloques
export class MinDayDistanceConstraint extends DayConstraint {
    name = "MinDayDistance [R5]";

    isSatisfied(
        day: string,
        materia: MateriaInput,
        assigned: FranjaHoraria[],
        ctx: DayConstraintContext,
    ): boolean {
        if (materia.creditos < 4) return true;
        if (assigned.length === 0) return true;

        const idx = ctx.days.indexOf(day);
        return assigned.every(b => {
            const bIdx = ctx.days.indexOf(b.dia);
            return Math.abs(idx - bIdx) >= MIN_DISTANCE;
        });
    }
}