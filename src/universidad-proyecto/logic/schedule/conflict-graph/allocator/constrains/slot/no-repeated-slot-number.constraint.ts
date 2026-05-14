import {SlotConstraint} from "../allocator-constraint.abstract.js";
import {FranjaHoraria} from "../../../../../models/franja-horaria";
import {MateriaInput} from "../../../../../models/input-base";

// [R4] Materias 2 créditos: no repetir el número de franja
export class NoRepeatedSlotNumberConstraint extends SlotConstraint {
    name = "NoRepeatedSlotNumber [R4]";

    isSatisfied(
        franja: FranjaHoraria,
        materia: MateriaInput,
        assigned: FranjaHoraria[],
        _strict: boolean,
    ): boolean {
        if (materia.creditos !== 2) return true;
        return !assigned.some(b => b.numero === franja.numero);
    }
}