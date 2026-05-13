import type {Request, Response} from "express";
import {ScheduleService} from "../service/schedule.service.js";

const scheduleService = new ScheduleService();

export const ScheduleController = {
    async getHorario(_req: Request, res: Response): Promise<void> {
        const horario = await scheduleService.getHorarioGlobal();
        res.json({success: true, data: {horario}});
    },

    async getGrafoInfo(_req: Request, res: Response): Promise<void> {
        const grafo = await scheduleService.getGrafoInfo();
        res.json({success: true, data: grafo});
    }
};