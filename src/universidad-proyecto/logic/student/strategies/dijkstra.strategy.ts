import {ScheduleStrategy, type StrategyResult} from "./schedule.strategy";
import type {DaySubgraphBuilder} from "../builders/day-subgraph.builder";
import type {AsignacionResultado} from "../../models/resultado.model";
import {WEEKDAY} from "../../models/dias-semana";
import {Dijkstra} from "../../../../algoritmos/camino-corto/Dijkstra/dijkstra";
import type {StudentNode} from "../student.node";
import {ConstraintChecker} from "../contraints/constraint-checker";
import {ConsistentGroupConstraint} from "../contraints/consistent-group.constraint";
import {NoGroupRepetitionConstraint} from "../contraints/no-group-repetition.constraint";
import {NoOverlapConstraint} from "../contraints/no-overlap.constraint";
import {MaxFatigueConstraint} from "../contraints/max-fatigue.constraint";
import {NoImmediateSedeChangeConstraint} from "../contraints/no-immediate-sede-change.constraint";
import {MaxSubjectsPerDayConstraint} from "../contraints/max-subjects-per-day.constraint";

export class DijkstraStrategy extends ScheduleStrategy {

    constructor(private readonly builder: DaySubgraphBuilder) {
        super();
    }

    resolve(
        bloques: AsignacionResultado[],
        grupoElegido: Map<string, string>,
    ): StrategyResult {
        const seleccion = new Map<string, AsignacionResultado>();

        for (const day of WEEKDAY.ALL) {
            const bloquesDia = bloques.filter(b => b.franja.startsWith(day.code));
            if (bloquesDia.length === 0) continue;

            const {graph, sourceVertex, vertexMap} = this.builder.build(day, bloquesDia);
            const dijkstra = new Dijkstra<StudentNode>(graph, sourceVertex.id);

            // Construir mapa de distancias para MaxFatigueConstraint
            const distanceMap = new Map<string, number>();
            for (const [key, v] of vertexMap) {
                distanceMap.set(key, dijkstra.getDistance(v.id));
            }

            const checker = new ConstraintChecker([
                new ConsistentGroupConstraint(),
                new NoGroupRepetitionConstraint(),
                new NoOverlapConstraint(),
                new MaxFatigueConstraint(distanceMap),
                new NoImmediateSedeChangeConstraint(),
                new MaxSubjectsPerDayConstraint()
            ]);

            const ordenados = [...bloquesDia].sort((a, b) =>
                (distanceMap.get(this.builder.buildKey(a)) ?? Infinity) -
                (distanceMap.get(this.builder.buildKey(b)) ?? Infinity)
            );

            const confirmadosHoy: AsignacionResultado[] = [];

            for (const bloque of ordenados) {
                const bloqueKey = this.builder.buildKey(bloque);
                if (seleccion.has(bloqueKey)) continue;

                const {passes} = checker.check(bloque, confirmadosHoy, grupoElegido);
                if (!passes) continue;

                const materiaId = this.getMateriaId(bloque);
                if (!grupoElegido.has(materiaId)) grupoElegido.set(materiaId, bloque.grupo);

                seleccion.set(bloqueKey, bloque);
                confirmadosHoy.push(bloque);
            }
        }

        return {seleccion, grupoElegido};
    }
}