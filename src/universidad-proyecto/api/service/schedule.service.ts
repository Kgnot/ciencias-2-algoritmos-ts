import {SchedulerDataLoader} from "../../data/scheduler-data-loader.js";
import {ConflictGraphBuilder} from "../../logic/schedule/conflict-graph/conflict-graph-builder.js";
import {ScheduleBuilder, type HorarioSemanal} from "../../logic/schedule/scheduler-builder.js";
import {DSatur} from "../../../algoritmos/coloreado/D-Satur/d-satur.js";

export class ScheduleService {

    private static instance: ScheduleService | null = null;
    private horarioGlobal: HorarioSemanal | null = null;

    private constructor() {
    }

    public static getInstance(): ScheduleService {
        if (!this.instance) {
            this.instance = new ScheduleService();
        }
        return this.instance;
    }

    async getHorarioGlobal(): Promise<HorarioSemanal> {
        if (this.horarioGlobal) return this.horarioGlobal;

        const input = SchedulerDataLoader.build().getData();
        const {graph} = new ConflictGraphBuilder(input).build();
        const algoritmo = new DSatur(graph, input.salones.map(s => s.id));
        const horario = new ScheduleBuilder(graph, input.salones).buildHorario(algoritmo);

        this.horarioGlobal = horario;
        return horario;
    }

    async getGrafoInfo(): Promise<{ vertices: number; aristas: number }> {
        const {graph} = new ConflictGraphBuilder(SchedulerDataLoader.build().getData()).build();
        return {
            vertices: graph.getVertex().length,
            aristas: graph.getEdges().length
        };
    }

    getHorarioCache(): HorarioSemanal | null {
        return this.horarioGlobal;
    }
}