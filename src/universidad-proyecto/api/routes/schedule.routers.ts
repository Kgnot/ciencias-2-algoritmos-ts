import { Router } from "express";
import { trycatch } from "../helpers/trycath.helper";
import { ScheduleController } from "../controller/schedule.controller";

const router = Router();

router.get("/schedule",                    trycatch(ScheduleController.getHorario));
router.get("/schedule/grafo",              trycatch(ScheduleController.getGrafoInfo));
router.get("/schedule/graph-data",         trycatch(ScheduleController.getGraphData));
router.get("/schedule/algorithm-comparison", trycatch(ScheduleController.getAlgorithmComparison));

export default router;
