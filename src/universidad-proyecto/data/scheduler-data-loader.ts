import rawData from "./data2.json";
import type {MateriaInput, SalonInput, ScheduleInput} from "../logic/models/input-base";


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