import type {AsignacionResultado} from "../../models/resultado.model";

export abstract class ScheduleConstraint {
    abstract name: string;
    abstract isSatisfied(
        candidate: AsignacionResultado,
        confirmed: AsignacionResultado[],
        grupoElegido: Map<string, string>,
    ): boolean;

    protected getMateriaId(a: AsignacionResultado): string {
        const parts = a.grupo.split("-G");
        return parts.slice(0, -1).join("-G") || a.grupo;
    }

    protected horaAMinutos(hora: string): number {
        const [hh, mm] = hora.split(":").map(Number);
        return (hh || 0) * 60 + (mm || 0);
    }

    protected getNumeroBloque(a: AsignacionResultado): number {
        return parseInt((a.franja.split("-")[1] ?? "A1").slice(1), 10) || 1;
    }
}