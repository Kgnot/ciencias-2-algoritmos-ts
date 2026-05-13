import type { HorarioSemanal } from "../../logic/schedule/scheduler-builder.js";
import type { SalonInput } from "../../logic/models/input-base.js";
import type { StudentScheduleRequest, StudentScheduleResponse } from "../../logic/student/student.model.js";
import { StudentScheduleSolver } from "../../logic/student/student-schedule.solver.js";

export class StudentService {

    private static instance: StudentService | null = null;
    private readonly horariosEstudiantes = new Map<string, StudentScheduleResponse>();

    private constructor() {
    }

    public static getInstance(): StudentService {
        if (!this.instance) {
            this.instance = new StudentService();
        }
        return this.instance;
    }

    async createSchedule(
        horario: HorarioSemanal,
        salones: SalonInput[],
        request: StudentScheduleRequest
    ): Promise<StudentScheduleResponse> {
        // El solver ahora recibe solo el request, y usa GlobalContext internamente
        const solver = new StudentScheduleSolver(request);
        const resultado = solver.execute();

        this.horariosEstudiantes.set(request.estudianteId, resultado);
        return resultado;
    }

    getSchedule(estudianteId: string): StudentScheduleResponse | undefined {
        return this.horariosEstudiantes.get(estudianteId);
    }

    getAllSchedules(): Array<{ estudianteId: string; schedule: StudentScheduleResponse }> {
        return Array.from(this.horariosEstudiantes.entries()).map(([estudianteId, schedule]) => ({
            estudianteId,
            schedule
        }));
    }
}