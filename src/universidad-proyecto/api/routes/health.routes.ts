import { Router } from "express";
import {trycatch} from "../helpers/trycath.helper.js";

const router = Router();

router.get("/health", trycatch(async (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
}));

export default router;