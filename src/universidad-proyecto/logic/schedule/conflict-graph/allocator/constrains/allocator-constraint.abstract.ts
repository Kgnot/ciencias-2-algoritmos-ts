import type {MateriaInput} from "../../../../models/input-base";
import type {FranjaHoraria} from "../../../../models/franja-horaria";


// tenemos la restriccion sobre el día
export abstract class DayConstraint {
    abstract name: string;
    abstract isSatisfied(
        day: string,
        materia: MateriaInput,
        assigned: FranjaHoraria[],
        context: DayConstraintContext,
    ): boolean;
}

// y restriccion para slots
export abstract class SlotConstraint {
    abstract name: string;
    abstract isSatisfied(
        franja: FranjaHoraria,
        materia: MateriaInput,
        assigned: FranjaHoraria[],
        strict: boolean,
    ): boolean;
}

export interface DayConstraintContext {
    days: string[];
    heavyPerDayCounter: Map<string, number>;
    heavyDayLimit: number;
}