import {ScheduleConstraint} from "./schedule-constraint.abstract.js";
import type {AsignacionResultado} from "../../models/resultado.model.js";

const MAX_FATIGA_PISOS = 10;

// La distancia Dijkstra (fatiga por pisos) no puede superar el límite
export class MaxFatigueConstraint extends ScheduleConstraint {
    name = "MaxFatigue";

    constructor(
        private readonly distanceMap: Map<string, number>
    ) {
        super();
    }

    isSatisfied(
        candidate: AsignacionResultado,
        _confirmed: AsignacionResultado[],
    ): boolean {
        const key = `${candidate.grupo}|${candidate.franja}`;
        const distancia = this.distanceMap.get(key) ?? Infinity;
        return distancia <= MAX_FATIGA_PISOS;
    }
}