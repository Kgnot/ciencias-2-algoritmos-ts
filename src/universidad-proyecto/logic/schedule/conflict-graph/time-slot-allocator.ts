import type {MateriaInput} from "../../models/input-base.js";
import type {FranjaHoraria} from "../../models/franja-horaria.js";
import {Graph} from "../../../../estructuras/graph/graph.js";
import type {GrupoData} from "../../models/grupo-data.model.js";
import {Vertex} from "../../../../estructuras/vertex.js";
import type {TimeSlotOccupancy} from "./time-slot-occupancy.js";
import {VertexFactory} from "./vertex-factory.js";

/*
 * TimeSlotAllocator — núcleo de asignación de franjas horarias.
 *
 * Reglas aplicadas:
 *
 *  [R1] Materias con más créditos tienen prioridad de asignación.
 *  [R2] Un mismo grupo no puede tener dos bloques el mismo día.
 *  [R3] Materias de 3+ créditos NO pueden tener bloques en días consecutivos
 *       (ej. Lunes→Martes prohibido; Lunes→Miércoles permitido).
 *  [R4] Materias de 2 créditos SÍ pueden tener días consecutivos,
 *       pero no pueden repetir el mismo número de franja (evita siempre A1).
 *  [R5] Materias de 4 créditos deben tener al menos un día de "descanso"
 *       entre cualquier par de bloques (distancia mínima de 2 días).
 *  [R6] Materias de 3+ créditos solo se asignan en franjas entre 08:00 y 20:00.
 *  [R7] Materias de laboratorio prefieren franjas de tarde (10:00+).
 *  [R8] No más de heavyDayLimit materias "pesadas" (3+ créditos) del mismo
 *       semestre+carrera pueden caer el mismo día. El límite se calcula
 *       dinámicamente: ceil(maxGruposPesados / númeroDías), mínimo 2.
 *       Esto evita saturar los días cuando hay muchos grupos de una materia.
 *  [R9] Los bloques de un mismo grupo no pueden ocupar franjas numéricamente
 *       consecutivas dentro del mismo día.
 */

const MIN_HOUR_HEAVY = 8;   // [R6] hora mínima para materias de 3+ créditos
const MAX_HOUR_HEAVY = 20;  // [R6] hora máxima (exclusiva)
const MIN_HOUR_LAB = 10;  // [R7] hora mínima preferida para laboratorios

export class TimeSlotAllocator {

    private vertices: Vertex<GrupoData>[] = [];

    private readonly days = [
        "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
    ];

    /**
     * Límite dinámico de materias pesadas por día/semestre/carrera. [R8]
     * Se calcula en allocate() antes de procesar las materias.
     */
    private heavyDayLimit = 2;

    /**
     * Rastreo de cuántas materias pesadas (3+ créditos) hay por día
     * para cada combinación semestre+carrera.
     * Clave: `"${semestre}-${carrera}-${dia}"`
     */
    private heavyPerDayCounter = new Map<string, number>();

    constructor(
        private readonly graph: Graph<GrupoData>,
        private readonly franjas: FranjaHoraria[],
        private readonly occupancy: TimeSlotOccupancy,
        private readonly normalLimit: number,
        private readonly labLimit: number,
    ) {
    }

    // -------------------------------------------------------------------------
    // API pública
    // -------------------------------------------------------------------------

    allocate(materias: MateriaInput[]): Vertex<GrupoData>[] {
        // [R8] Calcular límite dinámico antes de asignar
        this.heavyDayLimit = this.calcHeavyDayLimit(materias);

        // [R1] Prioridad por créditos descendente; desempate por id para determinismo
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

    // -------------------------------------------------------------------------
    // Cálculo del límite dinámico [R8]
    // -------------------------------------------------------------------------

    /**
     * Calcula cuántos bloques pesados puede haber por día/semestre/carrera.
     *
     * Razonamiento: si una materia tiene N grupos y cada grupo necesita
     * `creditos` bloques distribuidos en `days.length` días, el mínimo
     * slots por día necesarios es ceil(N * creditos / days.length).
     * Tomamos el máximo entre todas las materias pesadas y garantizamos
     * un mínimo de 2.
     */
    private calcHeavyDayLimit(materias: MateriaInput[]): number {
        const heavyMaterias = materias.filter(m => m.creditos >= 3);
        if (heavyMaterias.length === 0) return 2;

        // Agrupar por semestre+carrera para calcular la presión real por grupo
        const pressureMap = new Map<string, number>();
        for (const m of heavyMaterias) {
            const key = `${m.semestre}-${m.carrera}`;
            const current = pressureMap.get(key) ?? 0;
            // Presión = bloques totales que necesitan días en esa combinación
            pressureMap.set(key, current + m.grupos * m.creditos);
        }

        // El límite debe acomodar la combinación más presionada
        let maxPressure = 0;
        for (const pressure of pressureMap.values()) {
            maxPressure = Math.max(maxPressure, pressure);
        }

        const limit = Math.ceil(maxPressure / this.days.length);
        const result = Math.max(limit, 2);

        console.log(`[Allocator] heavyDayLimit calculado: ${result} (presión máx: ${maxPressure})`);
        return result;
    }

    // -------------------------------------------------------------------------
    // Asignación por materia → grupo → bloque
    // -------------------------------------------------------------------------

    private allocateMateria(materia: MateriaInput, offset: number): number {
        for (let g = 1; g <= materia.grupos; g++) {
            offset = this.allocateGroup(materia, g, offset);
        }
        return offset;
    }

    private allocateGroup(
        materia: MateriaInput,
        group: number,
        offset: number,
    ): number {
        const totalBlocks = materia.creditos;
        const usedDays = new Set<string>();
        const assigned: FranjaHoraria[] = [];
        let count = 0;

        for (let b = 0; b < totalBlocks; b++) {
            console.log(`[DEBUG] Antes bloque ${b}: usedDays=${[...usedDays]}, assigned días=${assigned.map(f=>f.dia)}`);
            const franja = this.allocateBlock(
                materia, group, b, usedDays, assigned, offset,
            );

            if (franja) {
                console.log(`[DEBUG] Asignado bloque ${b} → día ${franja.dia}`);
                assigned.push(franja);
                usedDays.add(franja.dia);
                count++;

                // [R8] contabilizar materias pesadas por día
                if (materia.creditos >= 3) {
                    const key = this.heavyKey(materia, franja.dia);
                    this.heavyPerDayCounter.set(key, (this.heavyPerDayCounter.get(key) ?? 0) + 1);
                }
            }
        }

        if (count < totalBlocks) {
            console.warn(`[Allocator] ${materia.id} G${group}: ${count}/${totalBlocks} bloques asignados`);
        }

        return offset + totalBlocks;
    }

    // -------------------------------------------------------------------------
    // Asignación de un bloque individual
    // -------------------------------------------------------------------------

    private allocateBlock(
        materia: MateriaInput,
        group: number,
        block: number,
        usedDays: Set<string>,
        assigned: FranjaHoraria[],
        offset: number,
    ): FranjaHoraria | null {
        for (let di = 0; di < this.days.length; di++) {
            const day = this.days[(block + di + offset) % this.days.length]!;

            // [R2] No repetir día en el mismo grupo
            if (usedDays.has(day)) continue;

            console.log(`[BLOCK] ${materia.id} G${group} B${block} intentando día=${day} | usedDays=${[...usedDays]}`);

            // [R3] 3+ créditos: no días consecutivos con ningún bloque ya asignado
            if (materia.creditos >= 3 && this.hasConsecutiveDay(day, assigned)) continue;

            // [R5] 4 créditos: distancia mínima de 2 días con todos los bloques asignados
            if (materia.creditos >= 4 && !this.hasMinDayDistance(day, assigned, 2)) continue;

            // [R8] No saturar el día con materias pesadas del mismo semestre/carrera
            if (materia.creditos >= 3 && this.isHeavyDaySaturated(materia, day)) continue;

            const franja = this.findAvailableSlot(materia, day, assigned, offset, block);
            if (!franja) continue;
            console.log(`[FOUND] franja.dia=${franja.dia} para day=${day}`);
            if (assigned.some(b => b.dia === franja.dia)) continue;
            // Confirmar ocupación
            const vertex = VertexFactory.create(materia, group, block, franja);
            this.graph.addVertex(vertex);
            this.vertices.push(vertex);
            this.occupancy.occupy(franja.id, materia.tipo);

            return franja;
        }

        console.warn(`[Allocator] Sin slot: ${materia.id} G${group} bloque ${block}`);
        return null;
    }

    // -------------------------------------------------------------------------
    // Búsqueda de franja disponible dentro de un día
    // -------------------------------------------------------------------------

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

        // Primera pasada: respetando todas las reglas incluyendo preferencias
        for (let i = 0; i < slotsOfDay.length; i++) {
            const slot = slotsOfDay[(start + i) % slotsOfDay.length]!;
            if (
                this.occupancy.hasCapacity(slot.id, materia.tipo, limit) &&
                this.isValidSlot(slot, materia, assigned, true)
            ) {
                return slot;
            }
        }

        // Segunda pasada: relajar preferencias blandas (ej. laboratorio de mañana)
        for (let i = 0; i < slotsOfDay.length; i++) {
            const slot = slotsOfDay[(start + i) % slotsOfDay.length]!;
            if (
                this.occupancy.hasCapacity(slot.id, materia.tipo, limit) &&
                this.isValidSlot(slot, materia, assigned, false)
            ) {
                return slot;
            }
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // Validación de una franja candidata
    // -------------------------------------------------------------------------

    /**
     * @param franja
     * @param materia
     * @param assigned
     * @param strict  Si true, aplica preferencias blandas (laboratorio tarde, etc.)
     *                Si false, solo aplica reglas duras.
     */
    private isValidSlot(
        franja: FranjaHoraria,
        materia: MateriaInput,
        assigned: FranjaHoraria[],
        strict: boolean,
    ): boolean {
        const hora = this.horaInicio(franja);

        // [R6] Materias de 3+ créditos solo entre 08:00 y 20:00
        if (materia.creditos >= 3) {
            if (hora < MIN_HOUR_HEAVY || hora >= MAX_HOUR_HEAVY) return false;
        }

        // [R7] Laboratorios prefieren tarde (10:00+) — solo en pasada estricta
        if (strict && materia.tipo === "laboratorio") {
            if (hora < MIN_HOUR_LAB) return false;
        }

        // [R4] Materias de 2 créditos: no repetir número de franja
        if (materia.creditos === 2) {
            if (assigned.some(b => b.numero === franja.numero)) return false;
        }

        // [R9] No franjas numéricamente consecutivas con bloques del mismo día
        const mismosDia = assigned.filter(b => b.dia === franja.dia);
        if (mismosDia.some(b => Math.abs(b.numero - franja.numero) === 1)) return false;

        return true;
    }

    // -------------------------------------------------------------------------
    // Helpers de distancia entre días
    // -------------------------------------------------------------------------

    /** [R3] True si `day` es adyacente (distancia 1) a algún día ya asignado */
    private hasConsecutiveDay(day: string, assigned: FranjaHoraria[]): boolean {
        const idx = this.days.indexOf(day);
        return assigned.some(b => {
            const bIdx = this.days.indexOf(b.dia);
            return Math.abs(idx - bIdx) === 1;
        });
    }

    /**
     * [R5] True si `day` cumple la distancia mínima con TODOS los bloques asignados.
     * minDistance = 2 → debe haber al menos un día libre entre ellos.
     */
    private hasMinDayDistance(
        day: string,
        assigned: FranjaHoraria[],
        minDistance: number,
    ): boolean {
        if (assigned.length === 0) return true;
        const idx = this.days.indexOf(day);
        return assigned.every(b => {
            const bIdx = this.days.indexOf(b.dia);
            return Math.abs(idx - bIdx) >= minDistance;
        });
    }

    // -------------------------------------------------------------------------
    // Helpers de saturación [R8]
    // -------------------------------------------------------------------------

    private isHeavyDaySaturated(materia: MateriaInput, day: string): boolean {
        const key = this.heavyKey(materia, day);
        const count = this.heavyPerDayCounter.get(key) ?? 0;
        return count >= this.heavyDayLimit;
    }

    private heavyKey(materia: MateriaInput, day: string): string {
        return `${materia.semestre}-${materia.carrera}-${day}`;
    }

    // -------------------------------------------------------------------------
    // Utilidades
    // -------------------------------------------------------------------------

    private horaInicio(franja: FranjaHoraria): number {
        return parseInt(franja.inicio.split(":")[0] ?? "0", 10);
    }
}

