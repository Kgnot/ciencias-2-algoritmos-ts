import rawData from "./data2.json" with {type: "json"};
import type {MateriaInput, SalonInput, ScheduleInput} from "../models/input-base.js";


export class SchedulerDataLoader {

    private readonly data: ScheduleInput;
    private static instance: SchedulerDataLoader;

    private constructor() {
        this.data = {
            materias: rawData.materias as MateriaInput[],
            salones: rawData.salones as SalonInput[],
            franjas: rawData.franjas
        };
    }

    public getData(): ScheduleInput {
        return this.data;
    }

    public static build() {
        if (!this.instance) {
            this.instance = new SchedulerDataLoader();
        }
        return this.instance;
    }
}