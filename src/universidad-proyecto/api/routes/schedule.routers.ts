import {Router} from "express";
import {trycatch} from "../helpers/trycath.helper.js";
import {ScheduleController} from "../controller/schedule.controller.js";

const router = Router();

router.get("/schedule", trycatch(ScheduleController.getHorario));
router.get("/schedule/grafo", trycatch(ScheduleController.getGrafoInfo));

export default router;