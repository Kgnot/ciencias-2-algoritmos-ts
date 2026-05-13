import {GlobalContext} from "../global.context.js";
import type {BloqueEstudiante, StudentScheduleRequest, StudentScheduleResponse} from "./student.model.js";
import type {AsignacionResultado} from "../models/resultado.model.js";
import {Graph} from "../../../estructuras/graph/graph.js";
import type {GrupoData} from "../models/grupo-data.model.js";
import {Vertex, type VertexID} from "../../../estructuras/vertex.js";
import {WEEKDAY} from "../models/dias-semana.js";
import type {StudentNode} from "./student.node.js";
import {Edge} from "../../../estructuras/edge.js";
import {type DiaSemana, seSolapan} from "../models/franja-horaria.js";
import {Dijkstra} from "../../../algoritmos/camino-corto/Dijkstra/dijkstra.js";

const PESO_CAMBIO_SEDE = 1000;
const MAX_FATIGA_PISOS = 10;
const SOURCE_ID = "__SOURCE__";

export class StudentScheduleSolver {

    private readonly globalContext: GlobalContext = GlobalContext.getInstance();

    constructor(private readonly request: StudentScheduleRequest) {
    }

    private log(...args: any[]) {
        console.log(`[StudentSolver][${this.request.estudianteId}]`, ...args);
    }

    public execute(): StudentScheduleResponse {
        this.log("START");

        const todosBloques = this.getAllBloquesDisponibles();
        this.log("Bloques disponibles:", todosBloques.length);

        const seleccion = this.resolverPorDia(todosBloques);

        const materiasAsignadas = new Set([...seleccion.values()].map(b => this.getMateriaId(b)));
        const materiasNoAsignadas = this.request.materias.filter(id => !materiasAsignadas.has(id));
        this.log("Materias no asignadas:", materiasNoAsignadas);

        const bloques: BloqueEstudiante[] = [];
        for (const asignacion of seleccion.values()) {
            bloques.push(this.toBloqueEstudiante(asignacion));
        }

        const cambiosDeSede = this.contarCambiosDeSede(bloques);
        const costoTotal = bloques.reduce((acc, b) => acc + b.piso, 0);
        const sedesUsadas = [...new Set(bloques.map((b) => b.sede))];

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

    // -------------------------------------------------------------------------
    // Obtención de bloques
    // -------------------------------------------------------------------------

    private getAllBloquesDisponibles(): AsignacionResultado[] {
        const graph: Graph<GrupoData> = this.globalContext.getGraph();
        const colorMap: Map<VertexID, string> = this.globalContext.getColorMap();

        this.log("graph.getVertex().length:", graph.getVertex().length);
        this.log("colorMap.size:", colorMap.size);

        const colorMapNorm = new Map<string, string>();
        for (const [vid, salon] of colorMap) {
            colorMapNorm.set(vid, salon);
        }
        this.log("colorMapNorm.size:", colorMapNorm.size);

        const resultado: AsignacionResultado[] = [];
        const materiasSet = new Set(this.request.materias);
        this.log("materiasSet:", [...materiasSet]);

        for (const vertex of graph.getVertex()) {
            const data: GrupoData = vertex.getValue();

            if (!materiasSet.has(data.materiaId)) continue;
            if (!data.franja || !data.salon) continue;

            const salonID = colorMapNorm.get(vertex.id);
            if (!salonID) {
                this.log("WARN sin color:", vertex.id);
                continue;
            }

            resultado.push({
                grupo: `${data.materiaId}-G${data.grupo}`,
                materia: data.nombre,
                semestre: data.semestre,
                franja: data.franja.id,
                horario: `${data.franja.inicio}-${data.franja.fin}`,
                salon: salonID,
                salonDetalle: data.salon,
                tipoSalon: data.tipoSalon,
                capacidad: data.salon.capacidad,
                color: salonID,
            });
        }

        return resultado;
    }

    // -------------------------------------------------------------------------
    // Resolución por día
    // -------------------------------------------------------------------------

    private resolverPorDia(bloques: AsignacionResultado[]): Map<string, AsignacionResultado> {
        const seleccion = new Map<string, AsignacionResultado>();

        // Registra qué grupo fue elegido por materia para mantener consistencia entre días
        // ej: "SIS-MAT1" → "SIS-MAT1-G1"
        const grupoElegido = new Map<string, string>();

        for (const day of WEEKDAY.ALL) {
            const bloquesDia = bloques.filter(b => b.franja.startsWith(day.code));
            if (bloquesDia.length === 0) continue;

            this.log(`Día ${day.code}:`, bloquesDia.length, "bloques");

            const {graph: subgraph, sourceVertex, vertexMap} = this.buildDaySubgraph(day, bloquesDia);
            const dijkstra = new Dijkstra<StudentNode>(subgraph, sourceVertex.id);

            const bloqueOrdenados = [...bloquesDia].sort((a, b) => {
                const vA = vertexMap.get(this.buildVertexIdStr(a))!;
                const vB = vertexMap.get(this.buildVertexIdStr(b))!;
                return dijkstra.getDistance(vA.id) - dijkstra.getDistance(vB.id);
            });

            const confirmadosHoy: AsignacionResultado[] = [];

            for (const bloque of bloqueOrdenados) {
                const materiaId = this.getMateriaId(bloque);

                // Si ya elegimos grupo para esta materia, solo aceptar ese grupo
                if (grupoElegido.has(materiaId) && grupoElegido.get(materiaId) !== bloque.grupo) {
                    continue;
                }

                // Clave única por grupo+franja — permite múltiples bloques de la misma materia
                const bloqueKey = this.buildVertexIdStr(bloque);
                if (seleccion.has(bloqueKey)) continue;

                // No dos bloques del mismo grupo en el mismo día
                if (confirmadosHoy.some(c => c.grupo === bloque.grupo)) continue;

                const vertex = vertexMap.get(bloqueKey)!;
                const distancia = dijkstra.getDistance(vertex.id);

                if (distancia > MAX_FATIGA_PISOS) {
                    this.log("SKIP fatiga:", bloque.grupo, distancia);
                    continue;
                }

                if (confirmadosHoy.some(c => this.sesolapanAsignaciones(c, bloque))) {
                    this.log("SKIP solapamiento:", bloque.grupo);
                    continue;
                }

                // Registrar grupo elegido para esta materia (solo la primera vez)
                if (!grupoElegido.has(materiaId)) {
                    grupoElegido.set(materiaId, bloque.grupo);
                    this.log("GRUPO ELEGIDO:", materiaId, "→", bloque.grupo);
                }

                this.log("SELECT:", bloque.grupo, "dist:", distancia);
                seleccion.set(bloqueKey, bloque);
                confirmadosHoy.push(bloque);
            }
        }

        return seleccion;
    }

    // -------------------------------------------------------------------------
    // Construcción del subgrafo por día
    // -------------------------------------------------------------------------

    private buildDaySubgraph(day: WEEKDAY, bloquesDia: AsignacionResultado[]) {
        const graph = new Graph<StudentNode>(true);

        const sourceVertex = new Vertex<StudentNode>(
            SOURCE_ID,
            {asignacion: null, materiaId: null}
        );
        graph.addVertex(sourceVertex);

        const vertexMap = new Map<string, Vertex<StudentNode>>();

        for (const bloque of bloquesDia) {
            const key = this.buildVertexIdStr(bloque);
            const v = new Vertex<StudentNode>(
                key,
                {asignacion: bloque, materiaId: this.getMateriaId(bloque)}
            );
            graph.addVertex(v);
            vertexMap.set(key, v);
        }

        // SOURCE → cada bloque (peso = piso del salón)
        for (const v of vertexMap.values()) {
            const piso = v.getValue().asignacion!.salonDetalle?.piso ?? 1;
            graph.addEdge(new Edge(sourceVertex, v, piso, true, Infinity));
        }

        // Aristas entre bloques del mismo día
        for (const a of bloquesDia) {
            for (const b of bloquesDia) {
                if (a === b) continue;
                if (!this.terminaAntesDe(a, b)) continue;

                const peso = this.calcularPesoArista(a, b);
                if (peso === null) continue;

                const vA = vertexMap.get(this.buildVertexIdStr(a))!;
                const vB = vertexMap.get(this.buildVertexIdStr(b))!;
                graph.addEdge(new Edge(vA, vB, peso, true, Infinity));
            }
        }

        this.log(`Subgrafo ${day.code}: V=${vertexMap.size}`);

        return {graph, sourceVertex, vertexMap};
    }

    // -------------------------------------------------------------------------
    // Helpers de ID
    // -------------------------------------------------------------------------

    /** Clave string única para un bloque: "grupo|franjaId" */
    private buildVertexIdStr(a: AsignacionResultado): string {
        return `${a.grupo}|${a.franja}`;
    }

    /** Extrae el materiaId del grupo. "SIS-MAT1-G1" → "SIS-MAT1" */
    private getMateriaId(a: AsignacionResultado): string {
        const parts = a.grupo.split("-G");
        return parts.slice(0, -1).join("-G") || a.grupo;
    }

    // -------------------------------------------------------------------------
    // Lógica de aristas
    // -------------------------------------------------------------------------

    private calcularPesoArista(from: AsignacionResultado, to: AsignacionResultado): number | null {
        const sedeDiff = from.salonDetalle?.sede !== to.salonDetalle?.sede;
        const pisoDiff = Math.abs(
            (from.salonDetalle?.piso ?? 1) - (to.salonDetalle?.piso ?? 1)
        );
        const esInmediato = this.getNumeroBloque(to) === this.getNumeroBloque(from) + 1;

        if (esInmediato && sedeDiff) return null;   // prohibida
        if (sedeDiff) return PESO_CAMBIO_SEDE;      // penalización fuerte
        return pisoDiff;                            // costo normal
    }

    // -------------------------------------------------------------------------
    // Métricas
    // -------------------------------------------------------------------------

    private contarCambiosDeSede(bloques: BloqueEstudiante[]): number {
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

    // -------------------------------------------------------------------------
    // Mapeador de salida
    // -------------------------------------------------------------------------

    private toBloqueEstudiante(a: AsignacionResultado): BloqueEstudiante {
        const [diaAbrev] = a.franja.split("-");
        const dia = this.abrevToDia(diaAbrev ?? "Lun");
        const [horaInicio, horaFin] = a.horario.split("-");

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
            bloque: this.getNumeroBloque(a),
        };
    }

    // -------------------------------------------------------------------------
    // Utilidades
    // -------------------------------------------------------------------------

    private getNumeroBloque(a: AsignacionResultado): number {
        const tipoNum = a.franja.split("-")[1] ?? "A1";
        return parseInt(tipoNum.slice(1), 10) || 1;
    }

    private terminaAntesDe(a: AsignacionResultado, b: AsignacionResultado): boolean {
        const [, finA] = a.horario.split("-");
        const [inicioB] = b.horario.split("-");
        return this.horaAMinutos(finA ?? "00:00") <= this.horaAMinutos(inicioB ?? "00:00");
    }

    private getDia(a: AsignacionResultado): DiaSemana {
        return this.abrevToDia(a.franja.split("-")[0] ?? "Lun");
    }

    private sesolapanAsignaciones(a: AsignacionResultado, b: AsignacionResultado): boolean {
        const [inicioA, finA] = a.horario.split("-");
        const [inicioB, finB] = b.horario.split("-");

        return seSolapan(
            {
                id: a.franja, tipo: "A", dia: this.getDia(a),
                numero: this.getNumeroBloque(a),
                inicio: inicioA ?? "00:00", fin: finA ?? "00:00",
            },
            {
                id: b.franja, tipo: "A", dia: this.getDia(b),
                numero: this.getNumeroBloque(b),
                inicio: inicioB ?? "00:00", fin: finB ?? "00:00",
            }
        );
    }

    private horaAMinutos(hora: string): number {
        const [hh, mm] = hora.split(":").map(Number);
        return (hh || 0) * 60 + (mm || 0);
    }

    private abrevToDia(abrev: string): DiaSemana {
        const map: Record<string, DiaSemana> = {
            Lun: "Lunes",
            Mar: "Martes",
            Mié: "Miércoles",
            Jue: "Jueves",
            Vie: "Viernes",
            Sáb: "Sábado",
        };
        return map[abrev] ?? "Lunes";
    }
}