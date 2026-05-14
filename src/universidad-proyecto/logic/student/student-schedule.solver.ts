import type {StudentScheduleRequest, StudentScheduleResponse, BloqueEstudiante} from "./student.model.js";
import type {AsignacionResultado} from "../models/resultado.model.js";
import type {DiaSemana} from "../models/franja-horaria.js";
import {BlockCollector} from "./collectors/block.collector.js";
import {DaySubgraphBuilder} from "./builders/day-subgraph.builder.js";
import {ScheduleMetrics} from "./metrics/schedule.metrics.js";
import type {ScheduleStrategy} from "./strategies/schedule.strategy.js";
import {DijkstraStrategy} from "./strategies/dijkstra.strategy.js";
import {BacktrackingStrategy} from "./strategies/back-tracking.strategy.js";


export class StudentScheduleSolver {

    private readonly collector: BlockCollector;
    private readonly builder: DaySubgraphBuilder;
    private readonly metrics: ScheduleMetrics;
    private readonly strategies: ScheduleStrategy[];

    constructor(private readonly request: StudentScheduleRequest) {
        this.collector = new BlockCollector();
        this.builder = new DaySubgraphBuilder();
        this.metrics = new ScheduleMetrics();
        this.strategies = [
            new DijkstraStrategy(this.builder),   // intenta primero con Dijkstra
            new BacktrackingStrategy(),            // fallback si Dijkstra no cubre todas las materias
        ];
    }

    private log(...args: any[]) {
        console.log(`[StudentSolver][${this.request.estudianteId}]`, ...args);
    }

    public execute(): StudentScheduleResponse {
        this.log("START");

        const materiasSet = new Set(this.request.materias);
        const todosBloques = this.collector.collect(materiasSet);
        this.log("Bloques disponibles:", todosBloques.length);

        const grupoElegido = new Map<string, string>();
        let seleccion = new Map<string, AsignacionResultado>();
        let materiasAsignadas = new Set<string>();

        // Cadena de estrategias: cada una intenta cubrir las materias restantes
        for (const strategy of this.strategies) {
            const materiasRestantes = this.request.materias.filter(m => !materiasAsignadas.has(m));
            if (materiasRestantes.length === 0) break;

            const bloquesRestantes = todosBloques.filter(b => materiasRestantes.includes(this.getMateriaId(b)));

            const result = strategy.resolve(bloquesRestantes, grupoElegido);

            for (const [key, val] of result.seleccion) seleccion.set(key, val);
            for (const [mid, grp] of result.grupoElegido) grupoElegido.set(mid, grp);

            materiasAsignadas = new Set([...seleccion.values()].map(b => this.getMateriaId(b)));

            this.log(`[${strategy.constructor.name}] asignadas: ${materiasAsignadas.size}/${this.request.materias.length}`);
        }

        const materiasNoAsignadas = this.request.materias.filter(m => !materiasAsignadas.has(m));
        this.log("Materias no asignadas:", materiasNoAsignadas);

        const bloques: BloqueEstudiante[] = [...seleccion.values()].map(a => this.toBloqueEstudiante(a));

        const cambiosDeSede = this.metrics.contarCambiosDeSede(bloques);
        const costoTotal = bloques.reduce((acc, b) => acc + b.piso, 0);
        const sedesUsadas = [...new Set(bloques.map(b => b.sede))];

        this.log("END", {total: bloques.length, cambiosDeSede, costoTotal});

        return {
            estudianteId: this.request.estudianteId,
            bloques,
            metricas: {
                totalBloques: bloques.length,
                cambiosDeSede,
                costoTotal,
                sedesUsadas,
                materiasNoAsignadas,
            },
        };
    }

    private getMateriaId(a: AsignacionResultado): string {
        const parts = a.grupo.split("-G");
        return parts.slice(0, -1).join("-G") || a.grupo;
    }

    private toBloqueEstudiante(a: AsignacionResultado): BloqueEstudiante {
        const [diaAbrev] = a.franja.split("-");
        const dia = this.abrevToDia(diaAbrev ?? "Lun");
        const [horaInicio, horaFin] = a.horario.split("-");
        const toNum = (f: AsignacionResultado) => parseInt((f.franja.split("-")[1] ?? "A1").slice(1), 10) || 1;

        return {
            materiaId: this.getMateriaId(a),
            nombreMateria: a.materia,
            grupo: a.grupo,
            dia,
            horaInicio: horaInicio ?? "00:00",
            horaFin: horaFin ?? "00:00",
            salon: a.salon,
            sede: a.salonDetalle?.sede ?? "",
            piso: a.salonDetalle?.piso ?? 1,
            tipoSalon: a.tipoSalon,
            bloque: toNum(a),
        };
    }

    private abrevToDia(abrev: string): DiaSemana {
        const map: Record<string, DiaSemana> = {
            Lun: "Lunes", Mar: "Martes", "Mié": "Miércoles",
            Jue: "Jueves", Vie: "Viernes", "Sáb": "Sábado",
        };
        return map[abrev] ?? "Lunes";
    }
}