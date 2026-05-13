import type {MateriaInput} from "../../models/input-base.js";
import type {FranjaHoraria} from "../../models/franja-horaria.js";
import {Graph} from "../../../estructuras/graph/graph.js";
import type {GrupoData} from "../../models/grupo-data.model.js";
import {Vertex} from "../../../estructuras/vertex.js";
import type {TimeSlotOccupancy} from "./time-slot-occupancy.js";
import {VertexFactory} from "./vertex-factory.js";
/*
*
* Es el núcleo de la asignación de horarios. Orquesta a whole el proceso de asignar franjas a cada bloque de cada materia, respetando:

    Materias con más créditos tienen prioridad
    Un mismo grupo no puede tener dos bloques el mismo día
    Límite de salones por franja (controlado por FranjaOccupancy)
*
*
* */

export class TimeSlotAllocator {
    private vertices: Vertex<GrupoData>[] = [];
    private days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

    constructor(
        private graph: Graph<GrupoData>,
        private franjas: FranjaHoraria[],
        private occupancy: TimeSlotOccupancy,
        private normalLimit: number,
        private labLimit: number
    ) {
    }

    allocate(materias: MateriaInput[]): Vertex<GrupoData>[] {
        const sorted = [...materias].sort((a, b) => b.creditos - a.creditos);
        let globalOffset = 0;

        for (const materia of sorted) {
            globalOffset = this.allocateMateria(materia, globalOffset);
        }

        return this.vertices;
    }

    private allocateMateria(materia: MateriaInput, offset: number): number {
        const blocks = materia.creditos;

        for (let g = 1; g <= materia.grupos; g++) {
            offset = this.allocateGroup(materia, g, blocks, offset);
        }

        return offset;
    }

    private allocateGroup(materia: MateriaInput, group: number, totalBlocks: number, offset: number): number {
        const usedDays = new Set<string>();
        let assigned = 0;

        for (let b = 0; b < totalBlocks; b++) {
            const success = this.allocateBlock(materia, group, b, usedDays, offset);
            if (success) assigned++;
        }

        if (assigned < totalBlocks) {
            console.warn(`${materia.id} G${group}: only ${assigned}/${totalBlocks} blocks assigned`);
        }

        return offset + totalBlocks;
    }

    private allocateBlock(
        materia: MateriaInput,
        group: number,
        block: number,
        usedDays: Set<string>,
        offset: number
    ): boolean {
        for (let dayOffset = 0; dayOffset < this.days.length; dayOffset++) {
            const day = this.days[(block + dayOffset + offset) % this.days.length];
            if (!day) throw new Error("No hay dia encontrado");
            if (usedDays.has(day)) continue;

            const franja = this.findAvailableSlot(materia, day, offset, block);
            if (franja) {
                const vertex = VertexFactory.create(materia, group, block, franja);
                this.graph.addVertex(vertex);
                this.vertices.push(vertex);

                this.occupancy.occupy(franja.id, materia.tipo);
                usedDays.add(day);
                return true;
            }
        }

        console.warn(`No slot: ${materia.id} G${group} block ${block}`);
        return false;
    }

    private findAvailableSlot(
        materia: MateriaInput,
        day: string,
        offset: number,
        block: number
    ): FranjaHoraria | null {
        const slots = this.franjas.filter(f => f.dia === day);
        const start = (offset + block) % slots.length;
        const limit = materia.tipo === "laboratorio" ? this.labLimit : this.normalLimit;

        for (let i = 0; i < slots.length; i++) {
            const slot = slots[(start + i) % slots.length];
            if (!slot) continue;
            if (this.occupancy.hasCapacity(slot.id, materia.tipo, limit)) {
                return slot;
            }
        }

        return null;
    }
}