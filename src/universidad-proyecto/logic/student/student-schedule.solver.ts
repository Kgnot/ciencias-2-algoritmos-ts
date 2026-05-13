import { Graph } from "../../../estructuras/graph/graph.js";
import { Vertex } from "../../../estructuras/vertex.js";
import { Edge } from "../../../estructuras/edge.js";
import { Dijkstra } from "../../../algoritmos/Dijkstra/dijkstra.js";
import type {HorarioClase, HorarioSemanal} from "../scheduler-builder.js";
import type {SalonInput} from "../../models/input-base.js";
import type {BloqueEstudiante, StudentScheduleRequest, StudentScheduleResponse} from "./student.model.js";
import type {DiaSemana} from "../../models/franja-horaria.js";



// ─── Constants ───────────────────────────────────────────────────────────────

const INF = 999_999;
const MIN_GAP_SEDE_DISTINTA = 120;
const COSTO_CONEXION = 1;
const START_ID = "__START__";
const END_ID = "__END__";

// ─── Internal types ───────────────────────────────────────────────────────────

interface CandidatoData {
    materiaId: string;
    materiaIdx: number;
    clase: HorarioClase;
    salon: SalonInput;
}

// ─── Main solver class ───────────────────────────────────────────────────────

export class StudentScheduleSolver {

    private readonly salonMap: Map<string, SalonInput>;

    constructor(
        private readonly horario: HorarioSemanal,
        salones: SalonInput[],
    ) {
        this.salonMap = new Map(salones.map(s => [s.id, s]));
    }

    // ─── Public API ──────────────────────────────────────────────────────────

    solve(request: StudentScheduleRequest): StudentScheduleResponse {
        const { estudianteId, materias } = request;

        const candidatosPorMateria = materias.map(mid => this.getCandidatos(mid));
        const materiasNoAsignadas = materias.filter((_, i) => candidatosPorMateria[i]!.length === 0);
        const materiasActivas = candidatosPorMateria.filter(c => c.length > 0);

        if (materiasActivas.length === 0) {
            return this.emptyResponse(estudianteId, materiasNoAsignadas);
        }

        const { graph } = this.buildDijkstraGraph(materiasActivas);
        const dijkstra = new Dijkstra(graph, START_ID);

        if (!dijkstra.hasPath(END_ID) || dijkstra.getDistance(END_ID) >= INF) {
            return this.emptyResponse(estudianteId, materias);
        }

        const path = dijkstra.getPath(END_ID).filter(id => id !== START_ID && id !== END_ID);
        const elegidos = path.map(id => graph.getVertexById(id).getValue() as CandidatoData);

        // ✅ FIX: Get ALL blocks for each selected materia, not just the first one
        const bloques: BloqueEstudiante[] = [];
        for (const elegido of elegidos) {
            const todosLosBloques = this.getBloquesCompletos(elegido.materiaId, elegido.clase.grupo);
            bloques.push(...todosLosBloques);
        }

        const cambiosDeSede = this.calcularCambiosDeSede(bloques);
        const costoReal = dijkstra.getDistance(END_ID);

        return {
            estudianteId,
            bloques,
            metricas: {
                totalBloques: bloques.length,
                cambiosDeSede,
                costoTotal: costoReal,
                sedesUsadas: [...new Set(bloques.map(b => b.sede))],
                materiasNoAsignadas,
            },
        };
    }

    // ─── Get complete blocks for a materia (all days of the week) ────────────

    private getBloquesCompletos(materiaId: string, grupo: string): BloqueEstudiante[] {
        const resultado: BloqueEstudiante[] = [];

        for (const diaObj of Object.values(this.horario)) {
            for (const clases of Object.values(diaObj)) {
                for (const clase of clases) {
                    // Match exact materia and group
                    if (!clase.vertexId.startsWith(`${materiaId}-G${grupo}`)) continue;
                    if (clase.salon === "Sin asignar") continue;

                    const salon = this.salonMap.get(clase.salon);
                    if (!salon) continue;

                    resultado.push({
                        materiaId,
                        nombreMateria: clase.materia,
                        grupo: clase.grupo,
                        dia: clase.dia as DiaSemana,
                        horaInicio: clase.horaInicio,
                        horaFin: clase.horaFin,
                        salon: salon.id,
                        sede: salon.sede,
                        piso: salon.piso,
                        tipoSalon: salon.tipo,
                        bloque: clase.bloque,
                    });
                }
            }
        }

        // Sort by day and time
        const diasOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        resultado.sort((a, b) => {
            const diaCompare = diasOrder.indexOf(a.dia) - diasOrder.indexOf(b.dia);
            if (diaCompare !== 0) return diaCompare;
            return this.toMin(a.horaInicio) - this.toMin(b.horaInicio);
        });

        return resultado;
    }

    // ─── Dijkstra graph construction ─────────────────────────────────────────

    private buildDijkstraGraph(activos: CandidatoData[][]): {
        graph: Graph<CandidatoData | null>;
    } {
        const graph = new Graph<CandidatoData | null>(true);

        const startV = new Vertex<CandidatoData | null>(START_ID, null);
        const endV = new Vertex<CandidatoData | null>(END_ID, null);
        graph.addVertex(startV);
        graph.addVertex(endV);

        const niveles: Vertex<CandidatoData | null>[][] = activos.map((candidatos, materiaIdx) =>
            candidatos.map((c, candidatoIdx) => {
                c.materiaIdx = materiaIdx;
                const id = `M${materiaIdx}-C${candidatoIdx}`;
                const v = new Vertex<CandidatoData | null>(id, c);
                graph.addVertex(v);
                return v;
            })
        );

        // START → level 0
        for (const v of niveles[0]!) {
            graph.addEdge(new Edge(startV, v, 0, true, 1));
        }

        // level[i] → level[i+1]
        for (let i = 0; i < niveles.length - 1; i++) {
            for (const vA of niveles[i]!) {
                for (const vB of niveles[i + 1]!) {
                    const cA = vA.getValue() as CandidatoData;
                    const cB = vB.getValue() as CandidatoData;
                    const peso = this.pesoCambioSede(cA, cB);
                    graph.addEdge(new Edge(vA, vB, peso, true, 1));
                }
            }
        }

        // Last level → END
        for (const v of niveles[niveles.length - 1]!) {
            graph.addEdge(new Edge(v, endV, 0, true, 1));
        }

        return { graph };
    }

    private pesoCambioSede(a: CandidatoData, b: CandidatoData): number {
        if (a.clase.dia !== b.clase.dia) return COSTO_CONEXION;

        const finA = this.toMin(a.clase.horaFin);
        const iniA = this.toMin(a.clase.horaInicio);
        const finB = this.toMin(b.clase.horaFin);
        const iniB = this.toMin(b.clase.horaInicio);

        if (iniA === iniB && finA === finB) return INF;
        if (iniA < finB && iniB < finA) return INF;

        const gap = iniB >= finA ? iniB - finA : iniA - finB;

        if (a.salon.sede === b.salon.sede) return COSTO_CONEXION;
        return gap >= MIN_GAP_SEDE_DISTINTA ? COSTO_CONEXION : INF;
    }

    private getCandidatos(materiaId: string): CandidatoData[] {
        const resultado: CandidatoData[] = [];

        for (const diaObj of Object.values(this.horario)) {
            for (const clases of Object.values(diaObj)) {
                for (const clase of clases) {
                    if (!clase.vertexId.startsWith(`${materiaId}-G`)) continue;
                    if (clase.salon === "Sin asignar") continue;

                    const salon = this.salonMap.get(clase.salon);
                    if (!salon) continue;

                    resultado.push({
                        materiaId,
                        materiaIdx: -1,
                        clase,
                        salon,
                    });
                }
            }
        }

        return resultado;
    }

    private calcularCambiosDeSede(bloques: BloqueEstudiante[]): number {
        const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        let cambios = 0;

        for (const dia of dias) {
            const delDia = bloques
                .filter(b => b.dia === dia)
                .sort((a, b) => this.toMin(a.horaInicio) - this.toMin(b.horaInicio));

            for (let i = 1; i < delDia.length; i++) {
                const prev = delDia[i - 1]!;
                const curr = delDia[i]!;
                const gap = this.toMin(curr.horaInicio) - this.toMin(prev.horaFin);
                if (gap < MIN_GAP_SEDE_DISTINTA && curr.sede !== prev.sede) cambios++;
            }
        }

        return cambios;
    }

    private emptyResponse(estudianteId: string, materiasNoAsignadas: string[]): StudentScheduleResponse {
        return {
            estudianteId,
            bloques: [],
            metricas: {
                totalBloques: 0,
                cambiosDeSede: 0,
                costoTotal: 0,
                sedesUsadas: [],
                materiasNoAsignadas,
            },
        };
    }

    private toMin(hora: string): number {
        const [hh, mm] = hora.split(":").map(Number);
        return (hh ?? 0) * 60 + (mm ?? 0);
    }
}