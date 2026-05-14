import type {Vertex} from "../../../../estructuras/vertex";
import {type FranjaHoraria, generarFranjas} from "../../models/franja-horaria";
import {Graph} from "../../../../estructuras/graph/graph";
import type {GrupoData} from "../../models/grupo-data.model";
import type {ScheduleInput} from "../../models/input-base";
import {TimeSlotAllocator} from "./allocator/time-slot-allocator";
import {EdgeCreator} from "./edge-creator";
import {TimeSlotOccupancy} from "./allocator/time-slot-occupancy";


/*
*
* Orquesta whole el proceso:

Genera todas las franjas horarias disponibles

Delega la asignación de tiempo a TimeSlotAllocator

Delega la creación de conflictos a EdgeCreator

Retorna el grafo construido y las franjas para su uso posterior en el coloreo

Es el punto de entrada único para construir el grafo de conflictos.
* */

export class ConflictGraphBuilder {
    private readonly franjas: FranjaHoraria[];
    private readonly graph: Graph<GrupoData>;
    private vertices: Vertex<GrupoData>[] = [];

    constructor(private readonly input: ScheduleInput) {
        this.franjas = generarFranjas(input.franjas);
        this.graph = new Graph<GrupoData>(false);
    }

    public build(): { graph: Graph<GrupoData>; timeSlots: FranjaHoraria[] } {
        this.allocateTimeSlots();
        this.createConflictEdges();
        return { graph: this.graph, timeSlots: this.franjas };
    }

    private allocateTimeSlots(): void {
        const normalLimit = this.input.salones.filter(s => s.tipo === "normal").length;
        const labLimit = this.input.salones.filter(s => s.tipo === "laboratorio").length;
        const occupancy = new TimeSlotOccupancy(this.franjas);

        const allocator = new TimeSlotAllocator(
            this.graph,
            this.franjas,
            occupancy,
            normalLimit,
            labLimit
        );

        this.vertices = allocator.allocate(this.input.materias);
    }

    private createConflictEdges(): void {
        EdgeCreator.connectByFranja(this.vertices, this.graph);
        EdgeCreator.connectSameGroupSameDay(this.vertices, this.graph);
    }

    // Getters
    public getGraph(): Graph<GrupoData> {
        return this.graph;
    }

    public getFranjas(): FranjaHoraria[] {
        return this.franjas;
    }

    public getVertices(): Vertex<GrupoData>[] {
        return this.vertices;
    }
}