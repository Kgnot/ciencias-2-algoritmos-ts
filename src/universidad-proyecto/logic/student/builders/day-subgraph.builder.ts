import type {AsignacionResultado} from "../../models/resultado.model";
import {Graph} from "../../../../estructuras/graph/graph";
import {Vertex} from "../../../../estructuras/vertex";
import {Edge} from "../../../../estructuras/edge";
import type {StudentNode} from "../student.node";
import type {WEEKDAY} from "../../models/dias-semana";

const PESO_CAMBIO_SEDE = 1000;
const SOURCE_ID = "__SOURCE__";

export interface DaySubgraph {
    graph: Graph<StudentNode>;
    sourceVertex: Vertex<StudentNode>;
    vertexMap: Map<string, Vertex<StudentNode>>;
}

export class DaySubgraphBuilder {

    build(day: WEEKDAY, bloquesDia: AsignacionResultado[]): DaySubgraph {
        const graph = new Graph<StudentNode>(true);

        const sourceVertex = new Vertex<StudentNode>(
            SOURCE_ID,
            {asignacion: null, materiaId: null}
        );
        graph.addVertex(sourceVertex);

        const vertexMap = new Map<string, Vertex<StudentNode>>();

        for (const bloque of bloquesDia) {
            const key = this.buildKey(bloque);
            const v = new Vertex<StudentNode>(key, {
                asignacion: bloque,
                materiaId: this.getMateriaId(bloque),
            });
            graph.addVertex(v);
            vertexMap.set(key, v);
        }

        // SOURCE → cada bloque
        for (const v of vertexMap.values()) {
            const piso = v.getValue().asignacion!.salonDetalle?.piso ?? 1;
            graph.addEdge(new Edge(sourceVertex, v, piso, true, Infinity));
        }

        // Aristas entre bloques
        for (const a of bloquesDia) {
            for (const b of bloquesDia) {
                if (a === b || !this.terminaAntesDe(a, b)) continue;
                const peso = this.calcularPeso(a, b);
                if (peso === null) continue;

                const vA = vertexMap.get(this.buildKey(a))!;
                const vB = vertexMap.get(this.buildKey(b))!;
                graph.addEdge(new Edge(vA, vB, peso, true, Infinity));
            }
        }

        return {graph, sourceVertex, vertexMap};
    }

    buildKey(a: AsignacionResultado): string {
        return `${a.grupo}|${a.franja}`;
    }

    getMateriaId(a: AsignacionResultado): string {
        const parts = a.grupo.split("-G");
        return parts.slice(0, -1).join("-G") || a.grupo;
    }

    private calcularPeso(from: AsignacionResultado, to: AsignacionResultado): number | null {
        const sedeDiff = from.salonDetalle?.sede !== to.salonDetalle?.sede;
        const pisoDiff = Math.abs((from.salonDetalle?.piso ?? 1) - (to.salonDetalle?.piso ?? 1));
        const esInmediato = this.getNumeroBloque(to) === this.getNumeroBloque(from) + 1;

        if (esInmediato && sedeDiff) return null;
        if (sedeDiff) return PESO_CAMBIO_SEDE;
        return pisoDiff;
    }

    private terminaAntesDe(a: AsignacionResultado, b: AsignacionResultado): boolean {
        const [, finA] = a.horario.split("-");
        const [inicioB] = b.horario.split("-");
        return this.horaAMinutos(finA ?? "00:00") <= this.horaAMinutos(inicioB ?? "00:00");
    }

    private getNumeroBloque(a: AsignacionResultado): number {
        const tipoNum = a.franja.split("-")[1] ?? "A1";
        return parseInt(tipoNum.slice(1), 10) || 1;
    }

    private horaAMinutos(hora: string): number {
        const [hh, mm] = hora.split(":").map(Number);
        return (hh || 0) * 60 + (mm || 0);
    }
}