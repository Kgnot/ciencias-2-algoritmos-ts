import type {BloqueEstudiante} from "../student.model";
import type {DiaSemana} from "../../models/franja-horaria";

export class ScheduleMetrics {

    contarCambiosDeSede(bloques: BloqueEstudiante[]): number {
        const porDia = new Map<DiaSemana, BloqueEstudiante[]>();
        for (const b of bloques) {
            const lista = porDia.get(b.dia) ?? [];
            lista.push(b);
            porDia.set(b.dia, lista);
        }

        let cambios = 0;
        for (const lista of porDia.values()) {
            lista.sort((a, b) => this.horaAMinutos(a.horaInicio) - this.horaAMinutos(b.horaInicio));
            for (let i = 1; i < lista.length; i++) {
                if (lista[i - 1]!.sede !== lista[i]!.sede) cambios++;
            }
        }
        return cambios;
    }

    private horaAMinutos(hora: string): number {
        const [hh, mm] = hora.split(":").map(Number);
        return (hh || 0) * 60 + (mm || 0);
    }
}