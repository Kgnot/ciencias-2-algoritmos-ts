import {SlotConstraint} from "../allocator-constraint.abstract.js";
import {FranjaHoraria} from "../../../../../models/franja-horaria";
import {MateriaInput} from "../../../../../models/input-base";

const MIN_HOUR_LAB = 10;


// [R7] Laboratorios prefieren franja de tarde (10:00+) — solo en pasada estricta
export class LabPrefersAfternoonConstraint extends SlotConstraint {
    name = "LabPrefersAfternoon [R7]";

    isSatisfied(
        franja: FranjaHoraria,
        materia: MateriaInput,
        _assigned: FranjaHoraria[],
        strict: boolean,
    ): boolean {
        if (!strict || materia.tipo !== "laboratorio") return true;

        const hora = parseInt(franja.inicio.split(":")[0] ?? "0", 10);
        return hora >= MIN_HOUR_LAB;
    }
}