import {SchedulerDataLoader} from "../data/scheduler-data-loader.js";
import {ScheduleBuilder} from "../logic/scheduler-builder.js";
import type {HorarioSemanal} from "../logic/scheduler-builder.js";
import {ConflictGraphBuilder} from "../logic/conflict-graph/conflict-graph-builder.js";

export interface GrafoStats {
    vertices: number;
    aristas: number;
}

export interface ValidacionesReporte {
    esValido: boolean;
    violaciones: string[];
    totalViolaciones: number;
}

export interface HorarioReporte {
    grafo: GrafoStats;
    horario: HorarioSemanal;
    validaciones: ValidacionesReporte;
}

function validarHorario(horario: HorarioSemanal): ValidacionesReporte {
    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const violaciones: string[] = [];

    for (const dia of dias) {
        const diaObj = horario[dia];
        if (!diaObj) continue;

        //contar bloques, no horas
        const bloquesPorGrupo = new Map<string, number>();
        const salonEnFranja = new Map<string, number>();

        for (const hora of Object.keys(diaObj)) {
            const clases = diaObj[hora] ?? [];
            for (const clase of clases) {
                const grupoKey = `${clase.materia}-${clase.grupo}`;
                const bloques = (bloquesPorGrupo.get(grupoKey) ?? 0) + 1;
                bloquesPorGrupo.set(grupoKey, bloques);

                if (bloques > 1) {
                    violaciones.push(
                        `${grupoKey} tiene ${bloques} bloques el ${dia} (máximo 1)`
                    );
                }

                const salonKey = `${hora}-${clase.salon}`;
                const ocurrencias = (salonEnFranja.get(salonKey) ?? 0) + 1;
                salonEnFranja.set(salonKey, ocurrencias);
                if (ocurrencias > 1) {
                    violaciones.push(
                        `Salón ${clase.salon} tiene ${ocurrencias} clases en franja ${hora} el ${dia}`
                    );
                }
            }
        }
    }

    return {
        esValido: violaciones.length === 0,
        violaciones,
        totalViolaciones: violaciones.length,
    };
}

export async function generarHorario(): Promise<HorarioReporte> {
    const loader = SchedulerDataLoader.build();
    const scheduleInput = loader.getData();

    const {graph} = new ConflictGraphBuilder(scheduleInput).build();

    const scheduleBuilder = new ScheduleBuilder(graph, scheduleInput.salones);
    const horario = scheduleBuilder.buildHorario();

    return {
        grafo: {
            vertices: graph.getVertex().length,
            aristas: graph.getEdges().length,
        },
        horario,
        validaciones: validarHorario(horario),
    };
}