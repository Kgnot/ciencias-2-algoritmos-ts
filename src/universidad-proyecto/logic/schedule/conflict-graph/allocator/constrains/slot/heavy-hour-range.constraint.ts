import {SlotConstraint} from "../allocator-constraint.abstract.js";
import {FranjaHoraria} from "../../../../../models/franja-horaria";
import {MateriaInput} from "../../../../../models/input-base";

const MIN_HOUR = 8;
const MAX_HOUR = 18;

// [R6] Materias 3+ créditos solo entre 08:00 y 20:00
export class HeavyHourRangeConstraint extends SlotConstraint {
    name = "HeavyHourRange [R6]";

    isSatisfied(
        franja: FranjaHoraria,
        materia: MateriaInput,
        _assigned: FranjaHoraria[],
        _strict: boolean,
    ): boolean {
        if (materia.creditos < 3) return true;

        const hora = parseInt(franja.inicio.split(":")[0] ?? "0", 10);
        return hora >= MIN_HOUR && hora < MAX_HOUR;
    }
}