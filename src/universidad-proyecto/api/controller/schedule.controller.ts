import type { Request, Response } from "express";
import { ScheduleService } from "../service/schedule.service";

const scheduleService = ScheduleService.getInstance();

export const ScheduleController = {
    async getHorario(_req: Request, res: Response): Promise<void> {
        try {
            const horario = await scheduleService.getHorarioGlobal();
            const grafo   = await scheduleService.getGrafoInfo();
            res.json({ success: true, data: { horario, grafo } });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : "Error al obtener horario"
            });
        }
    },

    async getGrafoInfo(_req: Request, res: Response): Promise<void> {
        try {
            const grafo = await scheduleService.getGrafoInfo();
            res.json({ success: true, data: grafo });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : "Error al obtener información del grafo"
            });
        }
    },

    async getGraphData(_req: Request, res: Response): Promise<void> {
        try {
            const data = await scheduleService.getGraphData();
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : "Error al obtener datos del grafo"
            });
        }
    },

    async getAlgorithmComparison(_req: Request, res: Response): Promise<void> {
        try {
            const data = await scheduleService.getAlgorithmComparison();
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : "Error al comparar algoritmos"
            });
        }
    }
};
