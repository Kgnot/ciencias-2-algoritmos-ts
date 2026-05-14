import {StudentController} from "../controller/student.controller";
import {trycatch} from "../helpers/trycath.helper";
import {Router} from "express";

const router = Router();

router.post("/student/schedule", trycatch(StudentController.createSchedule));
router.get("/student/schedule/:estudianteId", trycatch(StudentController.getSchedule));
router.get("/student/schedules", trycatch(StudentController.getAllSchedules));

export default router;