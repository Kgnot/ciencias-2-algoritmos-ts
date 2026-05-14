import type {Request, Response} from "express";
import {SchedulerDataLoader} from "../../data/scheduler-data-loader";
import {StudentService} from "../service/student.service";
import {ScheduleService} from "../service/schedule.service";

const studentService = StudentService.getInstance();
const scheduleService = ScheduleService.getInstance();

export const StudentController = {
    async createSchedule(req: Request, res: Response): Promise<void> {
        const body = req.body;

        if (!body.estudianteId || !Array.isArray(body.materias) || body.materias.length === 0) {
            res.status(400).json({success: false, error: "Se requiere estudianteId y materias[]."});
            return;
        }

        if (body.materias.length > 15) {
            res.status(400).json({success: false, error: "Máximo 15 materias por solicitud."});
            return;
        }

        const input = SchedulerDataLoader.build().getData();
        const horario = await scheduleService.getHorarioGlobal();
        const resultado = await studentService.createSchedule(horario, input.salones, body);

        res.json({success: true, data: resultado});
    },

    async getSchedule(req: Request, res: Response): Promise<void> {
        const {estudianteId} = req.params;

        if (!estudianteId) {
            res.status(400).json({success: false, error: "Se requiere estudianteId"});
            return;
        }

        const horario = studentService.getSchedule(String(estudianteId)); // lo convertimos directamente en string

        if (!horario) {
            res.status(404).json({
                success: false,
                error: `No se encontró horario para el estudiante ${estudianteId}`
            });
            return;
        }

        res.json({success: true, data: horario});
    },

    async getAllSchedules(_req: Request, res: Response): Promise<void> {
        const schedules = studentService.getAllSchedules();

        const estudiantes = schedules.map(({estudianteId, schedule}) => ({
            estudianteId,
            totalBloques: schedule.metricas.totalBloques,
            costoTotal: schedule.metricas.costoTotal,
            cambiosDeSede: schedule.metricas.cambiosDeSede,
            sedesUsadas: schedule.metricas.sedesUsadas,
            materiasNoAsignadas: schedule.metricas.materiasNoAsignadas
        }));

        estudiantes.sort((a, b) => a.estudianteId.localeCompare(b.estudianteId));

        res.json({
            success: true,
            data: {
                total: estudiantes.length,
                estudiantes
            }
        });
    }
};