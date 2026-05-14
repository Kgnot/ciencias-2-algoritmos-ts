import {SlotConstraint} from "../allocator-constraint.abstract.js";
import {FranjaHoraria} from "../../../../../models/franja-horaria";
import {MateriaInput} from "../../../../../models/input-base";

// [R9] No franjas numéricamente consecutivas dentro del mismo día
export class NoConsecutiveSlotConstraint extends SlotConstraint {
    name = "NoConsecutiveSlot [R9]";

    isSatisfied(
        franja: FranjaHoraria,
        _materia: MateriaInput,
        assigned: FranjaHoraria[],
        _strict: boolean,
    ): boolean {
        const mismosDia = assigned.filter(b => b.dia === franja.dia);
        return !mismosDia.some(b => Math.abs(b.numero - franja.numero) === 1);
    }
}