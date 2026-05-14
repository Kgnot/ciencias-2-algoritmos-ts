import {ScheduleStrategy, type StrategyResult} from "./schedule.strategy";
import type {AsignacionResultado} from "../../models/resultado.model";
import {ConstraintChecker} from "../contraints/constraint-checker";
import {ConsistentGroupConstraint} from "../contraints/consistent-group.constraint";
import {NoOverlapConstraint} from "../contraints/no-overlap.constraint";
import {NoImmediateSedeChangeConstraint} from "../contraints/no-immediate-sede-change.constraint";
import {MaxSubjectsPerDayConstraint} from "../contraints/max-subjects-per-day.constraint";

export class BacktrackingStrategy extends ScheduleStrategy {

    resolve(
        bloques: AsignacionResultado[],
        grupoElegido: Map<string, string>,
    ): StrategyResult {
        const checker = new ConstraintChecker([
            new ConsistentGroupConstraint(),
            new NoOverlapConstraint(),
            new NoImmediateSedeChangeConstraint(),
            new MaxSubjectsPerDayConstraint()

            // MaxFatigue no aplica por fallback xd
        ]);

        const porMateria = new Map<string, AsignacionResultado[]>();
        for (const b of bloques) {
            const mid = this.getMateriaId(b);
            if (!porMateria.has(mid)) porMateria.set(mid, []);
            porMateria.get(mid)!.push(b);
        }

        const porGrupo = new Map<string, AsignacionResultado[]>();
        for (const b of bloques) {
            if (!porGrupo.has(b.grupo)) porGrupo.set(b.grupo, []);
            porGrupo.get(b.grupo)!.push(b);
        }

        const materias = [...porMateria.keys()];
        const seleccion = new Map<string, AsignacionResultado>();

        this.backtrack(0, materias, porMateria, porGrupo, grupoElegido, seleccion, checker);

        return {seleccion, grupoElegido};
    }

    private backtrack(
        idx: number,
        materias: string[],
        porMateria: Map<string, AsignacionResultado[]>,
        porGrupo: Map<string, AsignacionResultado[]>,
        grupoElegido: Map<string, string>,
        seleccion: Map<string, AsignacionResultado>,
        checker: ConstraintChecker,
    ): boolean {
        if (idx === materias.length) return true;

        const materiaId = materias[idx]!;
        const grupos = [...new Set(porMateria.get(materiaId)!.map(b => b.grupo))];

        for (const grupo of grupos) {
            const bloquesGrupo = porGrupo.get(grupo) ?? [];
            const asignados = [...seleccion.values()];

            // Verificar todas las restricciones para cada bloque del grupo
            const todosValidos = bloquesGrupo.every(bloque => {
                const {passes} = checker.check(bloque, asignados, grupoElegido);
                return passes;
            });

            if (!todosValidos) continue;

            // Commit
            for (const bloque of bloquesGrupo) {
                seleccion.set(this.buildVertexIdStr(bloque), bloque);
            }
            grupoElegido.set(materiaId, grupo);

            if (this.backtrack(idx + 1, materias, porMateria, porGrupo, grupoElegido, seleccion, checker)) {
                return true;
            }

            // Rollback
            for (const bloque of bloquesGrupo) {
                seleccion.delete(this.buildVertexIdStr(bloque));
            }
            grupoElegido.delete(materiaId);
        }

        // Materia sin solución — continuar sin ella (horario parcial)
        return this.backtrack(idx + 1, materias, porMateria, porGrupo, grupoElegido, seleccion, checker);
    }
}