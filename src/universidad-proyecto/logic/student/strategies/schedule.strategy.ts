import type {AsignacionResultado} from "../../models/resultado.model.js";

export interface StrategyResult {
    seleccion: Map<string, AsignacionResultado>;
    grupoElegido: Map<string, string>;
}

export abstract class ScheduleStrategy {
    abstract resolve(
        bloques: AsignacionResultado[],
        grupoElegido: Map<string, string>
    ): StrategyResult;

    protected getMateriaId(a: AsignacionResultado): string {
        const parts = a.grupo.split("-G");
        return parts.slice(0, -1).join("-G") || a.grupo;
    }

    protected buildVertexIdStr(a: AsignacionResultado): string {
        return `${a.grupo}|${a.franja}`;
    }

    protected horaAMinutos(hora: string): number {
        const [hh, mm] = hora.split(":").map(Number);
        return (hh || 0) * 60 + (mm || 0);
    }

    protected terminaAntesDe(a: AsignacionResultado, b: AsignacionResultado): boolean {
        const [, finA] = a.horario.split("-");
        const [inicioB] = b.horario.split("-");
        return this.horaAMinutos(finA ?? "00:00") <= this.horaAMinutos(inicioB ?? "00:00");
    }
}