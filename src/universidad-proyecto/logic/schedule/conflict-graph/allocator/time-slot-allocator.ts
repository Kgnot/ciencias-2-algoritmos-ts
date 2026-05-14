import {Vertex} from "../../../../../estructuras/vertex";
import {GrupoData} from "../../../models/grupo-data.model";
import {AllocatorConstraintChecker} from "./constrains/allocator-constraint-checker";
import {FranjaHoraria} from "../../../models/franja-horaria";
import {Graph} from "../../../../../estructuras/graph/graph";
import {TimeSlotOccupancy} from "./time-slot-occupancy";
import {
    MinDayDistanceConstraint,
    NoConsecutiveDayConstraint,
    NoHeavyDaySaturationConstraint,
    NoRepeatedDayConstraint
} from "./constrains/day";
import {
    HeavyHourRangeConstraint,
    LabPrefersAfternoonConstraint, NoConsecutiveSlotConstraint,
    NoRepeatedSlotNumberConstraint
} from "./constrains/slot";
import {MateriaInput} from "../../../models/input-base";
import {DayConstraintContext} from "./constrains/allocator-constraint.abstract";
import {VertexFactory} from "./vertex-factory";

export class TimeSlotAllocator {

    private vertices: Vertex<GrupoData>[] = [];

    private readonly days = [
        "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
    ];

    private heavyDayLimit = 2;
    private heavyPerDayCounter = new Map<string, number>();

    private readonly checker: AllocatorConstraintChecker;

    constructor(
        private readonly graph: Graph<GrupoData>,
        private readonly franjas: FranjaHoraria[],
        private readonly occupancy: TimeSlotOccupancy,
        private readonly normalLimit: number,
        private readonly labLimit: number,
    ) {
        this.checker = new AllocatorConstraintChecker(
            // Day constraints — orden importa: más barato primero
            [
                new NoRepeatedDayConstraint(),        // [R2]
                new NoConsecutiveDayConstraint(),     // [R3]
                new MinDayDistanceConstraint(),       // [R5]
                new NoHeavyDaySaturationConstraint(), // [R8]
            ],
            // Slot constraints
            [
                new HeavyHourRangeConstraint(),          // [R6]
                new LabPrefersAfternoonConstraint(),     // [R7]
                new NoRepeatedSlotNumberConstraint(),    // [R4]
                new NoConsecutiveSlotConstraint(),       // [R9]
            ],
        );
    }

    // public

    allocate(materias: MateriaInput[]): Vertex<GrupoData>[] {
        this.heavyDayLimit = this.calcHeavyDayLimit(materias);

        // [R1] Prioridad por créditos descendente
        const sorted = [...materias].sort((a, b) =>
            b.creditos !== a.creditos
                ? b.creditos - a.creditos
                : a.id.localeCompare(b.id)
        );

        let globalOffset = 0;
        for (const materia of sorted) {
            globalOffset = this.allocateMateria(materia, globalOffset);
        }

        return this.vertices;
    }

    // Cálculo del límite dinámico [R8]
    private calcHeavyDayLimit(materias: MateriaInput[]): number {
        const heavyMaterias = materias.filter(m => m.creditos >= 3);
        if (heavyMaterias.length === 0) return 2;

        const pressureMap = new Map<string, number>();
        for (const m of heavyMaterias) {
            const key = `${m.semestre}-${m.carrera}`;
            pressureMap.set(key, (pressureMap.get(key) ?? 0) + m.grupos * m.creditos);
        }

        let maxPressure = 0;
        for (const p of pressureMap.values()) maxPressure = Math.max(maxPressure, p);

        const result = Math.max(Math.ceil(maxPressure / this.days.length), 2);
        console.log(`[Allocator] heavyDayLimit calculado: ${result} (presión máx: ${maxPressure})`);
        return result;
    }

    // Asignación por materia → grupo → bloque
    private allocateMateria(materia: MateriaInput, offset: number): number {
        for (let g = 1; g <= materia.grupos; g++) {
            offset = this.allocateGroup(materia, g, offset);
        }
        return offset;
    }

    private allocateGroup(materia: MateriaInput, group: number, offset: number): number {
        const totalBlocks = materia.creditos;
        const assigned: FranjaHoraria[] = [];
        let count = 0;

        for (let b = 0; b < totalBlocks; b++) {
            const franja = this.allocateBlock(materia, group, b, assigned, offset);
            if (franja) {
                assigned.push(franja);
                count++;

                // [R8] contabilizar
                if (materia.creditos >= 3) {
                    const key = `${materia.semestre}-${materia.carrera}-${franja.dia}`;
                    this.heavyPerDayCounter.set(key, (this.heavyPerDayCounter.get(key) ?? 0) + 1);
                }
            }
        }

        if (count < totalBlocks) {
            console.warn(`[Allocator] ${materia.id} G${group}: ${count}/${totalBlocks} bloques asignados`);
        }

        return offset + totalBlocks;
    }

    // Asignación de un bloque individual
    private allocateBlock(
        materia: MateriaInput,
        group: number,
        block: number,
        assigned: FranjaHoraria[],
        offset: number,
    ): FranjaHoraria | null {
        const ctx: DayConstraintContext = {
            days: this.days,
            heavyPerDayCounter: this.heavyPerDayCounter,
            heavyDayLimit: this.heavyDayLimit,
        };

        for (let di = 0; di < this.days.length; di++) {
            const day = this.days[(block + di + offset) % this.days.length]!;

            const {passes, failedConstraint} = this.checker.checkDay(day, materia, assigned, ctx);
            if (!passes) {
                continue;
            }

            const franja = this.findAvailableSlot(materia, day, assigned, offset, block);
            if (!franja) continue;

            const vertex = VertexFactory.create(materia, group, block, franja);
            this.graph.addVertex(vertex);
            this.vertices.push(vertex);
            this.occupancy.occupy(franja.id, materia.tipo);

            return franja;
        }
        return null;
    }

    // Búsqueda de franja disponible dentro de un día
    private findAvailableSlot(
        materia: MateriaInput,
        day: string,
        assigned: FranjaHoraria[],
        offset: number,
        block: number,
    ): FranjaHoraria | null {
        const slotsOfDay = this.franjas.filter(f => f.dia === day);
        const start = (offset + block) % Math.max(slotsOfDay.length, 1);
        const limit = materia.tipo === "laboratorio" ? this.labLimit : this.normalLimit;

        // Primera pasada: strict=true (preferencias blandas activas)
        for (let i = 0; i < slotsOfDay.length; i++) {
            const slot = slotsOfDay[(start + i) % slotsOfDay.length]!;
            if (
                this.occupancy.hasCapacity(slot.id, materia.tipo, limit) &&
                this.checker.checkSlot(slot, materia, assigned, true)
            ) {
                return slot;
            }
        }

        // Segunda pasada: strict=false (solo reglas duras)
        for (let i = 0; i < slotsOfDay.length; i++) {
            const slot = slotsOfDay[(start + i) % slotsOfDay.length]!;
            if (
                this.occupancy.hasCapacity(slot.id, materia.tipo, limit) &&
                this.checker.checkSlot(slot, materia, assigned, false)
            ) {
                return slot;
            }
        }

        return null;
    }
}