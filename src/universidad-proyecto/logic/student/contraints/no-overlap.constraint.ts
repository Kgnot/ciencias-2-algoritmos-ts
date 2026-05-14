import {ScheduleConstraint} from "./schedule-constraint.abstract.js";
import type {AsignacionResultado} from "../../models/resultado.model.js";
import {seSolapan, type DiaSemana} from "../../models/franja-horaria.js";

// Dos bloques en el mismo día no pueden solaparse en horario
export class NoOverlapConstraint extends ScheduleConstraint {
    name = "NoOverlap";

    isSatisfied(
        candidate: AsignacionResultado,
        confirmed: AsignacionResultado[],
    ): boolean {
        return !confirmed.some(c => this.sesolapan(c, candidate));
    }

    private sesolapan(a: AsignacionResultado, b: AsignacionResultado): boolean {
        const [iA, fA] = a.horario.split("-");
        const [iB, fB] = b.horario.split("-");
        return seSolapan(
            {
                id: a.franja,
                tipo: "A",
                dia: this.toDia(a),
                numero: this.getNumeroBloque(a),
                inicio: iA ?? "00:00",
                fin: fA ?? "00:00"
            },
            {
                id: b.franja,
                tipo: "A",
                dia: this.toDia(b),
                numero: this.getNumeroBloque(b),
                inicio: iB ?? "00:00",
                fin: fB ?? "00:00"
            },
        );
    }

    private toDia(a: AsignacionResultado): DiaSemana {
        const map: Record<string, DiaSemana> = {
            Lun: "Lunes", Mar: "Martes", "Mié": "Miércoles",
            Jue: "Jueves", Vie: "Viernes", "Sáb": "Sábado",
        };
        return map[a.franja.split("-")[0] ?? "Lun"] ?? "Lunes";
    }
}