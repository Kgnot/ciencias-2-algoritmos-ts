import type {DayConstraint, SlotConstraint, DayConstraintContext} from "./allocator-constraint.abstract.js";
import {MateriaInput} from "../../../../models/input-base";
import {FranjaHoraria} from "../../../../models/franja-horaria";

export class AllocatorConstraintChecker {

    constructor(
        private readonly dayConstraints: DayConstraint[],
        private readonly slotConstraints: SlotConstraint[],
    ) {
    }

    checkDay(
        day: string,
        materia: MateriaInput,
        assigned: FranjaHoraria[],
        ctx: DayConstraintContext,
    ): { passes: boolean; failedConstraint?: string } {
        for (const c of this.dayConstraints) {
            if (!c.isSatisfied(day, materia, assigned, ctx)) {
                return {passes: false, failedConstraint: c.name};
            }
        }
        return {passes: true};
    }

    checkSlot(
        franja: FranjaHoraria,
        materia: MateriaInput,
        assigned: FranjaHoraria[],
        strict: boolean,
    ): boolean {
        return this.slotConstraints.every(c => c.isSatisfied(franja, materia, assigned, strict));
    }
}