import {ScheduleConstraint} from "./schedule-constraint.abstract.js";
import type {AsignacionResultado} from "../../models/resultado.model.js";

const MAX_MATERIAS_POR_DIA = 6;

export class MaxSubjectsPerDayConstraint extends ScheduleConstraint {
    name = "MaxSubjectsPerDay";

    isSatisfied(
        candidate: AsignacionResultado,
        confirmed: AsignacionResultado[],
    ): boolean {
        const materiasHoy = new Set(confirmed.map(c => this.getMateriaId(c)));
        const candidateMateriaId = this.getMateriaId(candidate);

        // Si la materia del candidato ya está confirmada hoy, no suma al conteo
        if (materiasHoy.has(candidateMateriaId)) return true;

        return materiasHoy.size < MAX_MATERIAS_POR_DIA;
    }
}