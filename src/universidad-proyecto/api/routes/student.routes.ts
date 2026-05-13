import {StudentController} from "../controller/student.controller.js";
import {trycatch} from "../helpers/trycath.helper.js";
import {Router} from "express";

const router = Router();

router.post("/student/schedule", trycatch(StudentController.createSchedule));
router.get("/student/schedule/:estudianteId", trycatch(StudentController.getSchedule));
router.get("/student/schedules", trycatch(StudentController.getAllSchedules));

export default router;