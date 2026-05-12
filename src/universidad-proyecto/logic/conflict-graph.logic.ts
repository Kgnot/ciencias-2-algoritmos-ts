import type { ScheduleInput } from "../models/input-base.js";
import { type FranjaHoraria, generarFranjas } from "../models/franja-horaria.js";
import { Graph } from "../../estructuras/graph/graph.js";
import type { GrupoData } from "../models/grupo-data.model.js";
import { Vertex } from "../../estructuras/vertex.js";
import { Edge } from "../../estructuras/edge.js";

export class ConflictGraphBuilder {

    private readonly input: ScheduleInput;
    private readonly franjas: FranjaHoraria[];
    private readonly graph: Graph<GrupoData>;
    private readonly grupos: Vertex<GrupoData>[];

    constructor(input: ScheduleInput) {
        this.input = input;
        this.franjas = generarFranjas(input.franjas);
        this.graph = new Graph<GrupoData>(false);
        this.grupos = [];
    }

    private getFranjasNecesarias(creditos: number): number {
        if (creditos < 1 || creditos > 4) throw new Error(`Créditos inválidos: ${creditos}`);
        return creditos;
    }

    private expandGroupsAndAssignTimeSlots(): void {
        const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] as const;

        const franjaOccupancy = new Map<string, { normal: number; laboratorio: number }>();
        for (const fr of this.franjas) {
            franjaOccupancy.set(fr.id, { normal: 0, laboratorio: 0 });
        }

        const normalSalones = this.input.salones.filter(s => s.tipo === "normal").length;
        const labSalones    = this.input.salones.filter(s => s.tipo === "laboratorio").length;

        // Materias con más créditos primero → se distribuyen mejor
        const materiasOrdenadas = [...this.input.materias].sort((a, b) => b.creditos - a.creditos);

        let globalOffset = 0;

        for (const materia of materiasOrdenadas) {
            const totalBloques = this.getFranjasNecesarias(materia.creditos);

            for (let g = 1; g <= materia.grupos; g++) {
                const diasUsadosPorGrupo = new Set<string>();
                let bloquesAsignados = 0;

                for (let b = 0; b < totalBloques; b++) {
                    let assigned = false;

                    for (let dOffset = 0; dOffset < dias.length && !assigned; dOffset++) {
                        const dia = dias[(b + dOffset + globalOffset) % dias.length]!;
                        if (diasUsadosPorGrupo.has(dia)) continue;

                        const franjasDelDia = this.franjas.filter(fr => fr.dia === dia);
                        const startIdx = (globalOffset + b) % franjasDelDia.length;

                        for (let k = 0; k < franjasDelDia.length && !assigned; k++) {
                            const franja = franjasDelDia[(startIdx + k) % franjasDelDia.length]!;

                            const occ = franjaOccupancy.get(franja.id)!;
                            if (materia.tipo === "laboratorio" && occ.laboratorio >= labSalones) continue;
                            if (materia.tipo === "normal"      && occ.normal      >= normalSalones) continue;

                            const data: GrupoData = {
                                materiaId: materia.id,
                                nombre:    `${materia.nombre} G${g}`,
                                grupo:     String(g),
                                semestre:  materia.semestre,
                                tipoSalon: materia.tipo,
                                carrera:   materia.carrera,
                                creditos:  materia.creditos,
                                franja,
                                salon: null,
                                bloque: b,
                            };

                            const vertexId = `${materia.id}-G${g}-B${b}`;
                            const vertex   = new Vertex<GrupoData>(vertexId, data);
                            this.graph.addVertex(vertex);
                            this.grupos.push(vertex);

                            if (materia.tipo === "laboratorio") occ.laboratorio++;
                            else occ.normal++;
                            franjaOccupancy.set(franja.id, occ);

                            diasUsadosPorGrupo.add(dia);
                            bloquesAsignados++;
                            assigned = true;
                        }
                    }

                    if (!assigned) {
                        console.warn(`Sin franja disponible: ${materia.id} G${g} bloque ${b}`);
                    }
                }

                if (bloquesAsignados < totalBloques) {
                    console.warn(`⚠️ ${materia.id} G${g}: ${bloquesAsignados}/${totalBloques} bloques asignados`);
                }

                globalOffset += totalBloques;
            }
        }
    }

    /**
     * Regla de conflicto correcta:
     * Dos bloques necesitan salones DISTINTOS si y solo si están en la
     * misma franja horaria — sin importar carrera, semestre ni profesor.
     * Un salón físico no puede tener dos clases a la vez.
     *
     * Usamos agrupación por franjaId (O(n)) en vez del doble loop O(n²)
     * para no explotar con grafos grandes.
     */
    private detectConflictsAndEdges(): void {
        const porFranja = new Map<string, Vertex<GrupoData>[]>();

        for (const v of this.grupos) {
            const franjaId = v.getValue().franja!.id;
            if (!porFranja.has(franjaId)) porFranja.set(franjaId, []);
            porFranja.get(franjaId)!.push(v);
        }

        for (const [, enFranja] of porFranja) {
            for (let i = 0; i < enFranja.length; i++) {
                for (let j = i + 1; j < enFranja.length; j++) {
                    const va = enFranja[i]!;
                    const vb = enFranja[j]!;
                    const a  = va.getValue();
                    const b  = vb.getValue();

                    // Mismo grupo de la misma materia nunca cae en la misma franja
                    // (lo garantiza expand...), pero por seguridad:
                    if (a.materiaId === b.materiaId && a.grupo === b.grupo) continue;

                    this.graph.addEdge(new Edge(va, vb, 1, false, 1));
                }
            }
        }
    }

    public build(): { graph: Graph<GrupoData>; timeSlots: FranjaHoraria[] } {
        this.expandGroupsAndAssignTimeSlots();
        this.detectConflictsAndEdges();
        return { graph: this.graph, timeSlots: this.franjas };
    }

    public getGraph():   Graph<GrupoData>    { return this.graph; }
    public getFranjas(): FranjaHoraria[]     { return this.franjas; }
    public getGrupos():  Vertex<GrupoData>[] { return this.grupos; }
}