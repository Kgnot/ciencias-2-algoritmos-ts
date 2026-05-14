import type {FranjaHoraria} from "../../../models/franja-horaria";

export interface SlotUsage {
    normal: number;
    lab: number;
}

/*
*
* Define la estructura de datos que lleva el conteo de cuántos salones normales y laboratorios están ocupados en una franja horaria específica.
*
* */
export class TimeSlotOccupancy {
    private occupancy = new Map<string, SlotUsage>();

    constructor(franjas: FranjaHoraria[]) {
        for (const fr of franjas) {
            this.occupancy.set(fr.id, {normal: 0, lab: 0});
        }
    }

    hasCapacity(franjaId: string, tipo: "normal" | "laboratorio", limit: number) {
        const usage = this.occupancy.get(franjaId);
        if (!usage) return false;
        return tipo === "laboratorio" ? usage.lab < limit : usage.normal < limit;
    }

    occupy(franjaId: string, tipo: "normal" | "laboratorio") {
        const usage = this.occupancy.get(franjaId);
        if (!usage) return;
        if (tipo === "laboratorio") {
            usage.lab++;
        } else {
            usage.normal++;
        }

        this.occupancy.set(franjaId, usage);
    }

    getUsage(franjaId: string): SlotUsage | undefined {
        return this.occupancy.get(franjaId);
    }

    reset(): void {
        for (const [id, usage] of this.occupancy) {
            usage.normal = 0;
            usage.lab = 0;
            this.occupancy.set(id, usage);
        }
    }
}