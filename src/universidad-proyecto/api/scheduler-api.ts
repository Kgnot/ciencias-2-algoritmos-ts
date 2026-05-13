import express, { type Request, type Response } from "express";
import { ScheduleBuilder, type HorarioSemanal } from "../logic/scheduler-builder.js";
import { SchedulerDataLoader } from "../data/scheduler-data-loader.js";
import type { AlgoritmoColoreado } from "../logic/schedule-solver.js";
import { ConflictGraphBuilder } from "../logic/conflict-graph/conflict-graph-builder.js";
import type { StudentScheduleRequest, StudentScheduleResponse } from "../logic/student/student.model.js";
import { StudentScheduleSolver } from "../logic/student/student-schedule.solver.js";

export interface ScheduleResponse {
    success: boolean;
    data?: {
        algoritmo: string;
        grafo: { vertices: number; aristas: number };
        horario: HorarioSemanal;
    };
    error?: string;
}

export class SchedulerApiServer {
    // Persistencia básica
    private readonly horariosEstudiantes = new Map<string, StudentScheduleResponse>();

    private readonly app = express();
    private readonly port: number;
    private readonly cache = new Map<string, ScheduleResponse>();
    private horarioGlobal: HorarioSemanal | null = null;

    constructor(port: number = 3002) {
        this.port = port;
        this.enableCorsForAllOrigins();
        this.app.use(express.json());
        this.registerRoutes();
    }

    private enableCorsForAllOrigins(): void {
        this.app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
            if (req.method === "OPTIONS") {
                res.sendStatus(204);
                return;
            }
            next();
        });
    }

    private registerRoutes(): void {

        this.app.get("/api/health", (_req: Request, res: Response) => {
            res.json({ ok: true, timestamp: new Date().toISOString() });
        });

        this.app.get("/api/schedule", async (req: Request, res: Response) => {
            const algoritmo = (req.query["algoritmo"] as AlgoritmoColoreado) ?? "d-satur";
            try {
                res.json(await this.generateSchedule(algoritmo));
            } catch (error) {
                res.status(500).json({ success: false, error: (error as Error).message });
            }
        });

        this.app.get("/api/schedule/refresh", async (req: Request, res: Response) => {
            const algoritmo = (req.query["algoritmo"] as AlgoritmoColoreado) ?? "d-satur";
            this.cache.delete(algoritmo);
            this.horarioGlobal = null;
            try {
                res.json(await this.generateSchedule(algoritmo));
            } catch (error) {
                res.status(500).json({ success: false, error: (error as Error).message });
            }
        });

        this.app.get("/api/schedule/grafo", async (_req: Request, res: Response) => {
            try {
                const { graph } = new ConflictGraphBuilder(SchedulerDataLoader.build().getData()).build();
                res.json({ success: true, data: { vertices: graph.getVertex().length, aristas: graph.getEdges().length } });
            } catch (error) {
                res.status(500).json({ success: false, error: (error as Error).message });
            }
        });

        this.app.get("/api/schedule/comparar", async (_req: Request, res: Response) => {
            try {
                const input = SchedulerDataLoader.build().getData();
                const algoritmos: AlgoritmoColoreado[] = ["voraz", "welsh-powell", "d-satur"];
                const resultados: Record<string, { salones: number }> = {};

                for (const alg of algoritmos) {
                    const { graph } = new ConflictGraphBuilder(input).build();
                    const horario = new ScheduleBuilder(graph, input.salones).buildHorario(alg);
                    const usados = new Set(
                        Object.values(horario).flatMap(d =>
                            Object.values(d).flatMap(cs => cs.map(c => c.salon))
                        ).filter(s => s !== "Sin asignar")
                    );
                    resultados[alg] = { salones: usados.size };
                }

                res.json({ success: true, data: resultados });
            } catch (error) {
                res.status(500).json({ success: false, error: (error as Error).message });
            }
        });

        // ── POST /api/student/schedule ─────────────────────────────────────────
        this.app.post("/api/student/schedule", async (req: Request, res: Response) => {
            try {
                const body = req.body as StudentScheduleRequest;

                if (!body.estudianteId || !Array.isArray(body.materias) || body.materias.length === 0) {
                    res.status(400).json({ success: false, error: "Se requiere estudianteId y materias[]." });
                    return;
                }

                if (body.materias.length > 15) {
                    res.status(400).json({ success: false, error: "Máximo 15 materias por solicitud." });
                    return;
                }

                const input = SchedulerDataLoader.build().getData();
                const horario = await this.getHorarioGlobal();
                const solver = new StudentScheduleSolver(horario, input.salones);
                const resultado = solver.solve(body);

                this.horariosEstudiantes.set(body.estudianteId, resultado);

                res.json({ success: true, data: resultado });
            } catch (error) {
                res.status(500).json({ success: false, error: (error as Error).message });
            }
        });

        // ── GET /api/student/schedule/:estudianteId ────────────────────────────
        this.app.get("/api/student/schedule/:estudianteId", async (req: Request, res: Response) => {
            try {
                const { estudianteId } = req.params;

                if (!estudianteId) {
                    res.status(400).json({ success: false, error: "Se requiere estudianteId" });
                    return;
                }

                const horario = this.horariosEstudiantes.get(typeof estudianteId === "string" ? estudianteId : String(estudianteId));

                if (!horario) {
                    res.status(404).json({
                        success: false,
                        error: `No se encontró horario para el estudiante ${estudianteId}`
                    });
                    return;
                }

                res.json({ success: true, data: horario });
            } catch (error) {
                res.status(500).json({ success: false, error: (error as Error).message });
            }
        });

        // ── GET /api/student/schedules ─────────────────────────────────────────
        // Lista todos los estudiantes con horario generado
        this.app.get("/api/student/schedules", async (_req: Request, res: Response) => {
            try {
                const estudiantes = Array.from(this.horariosEstudiantes.keys()).map(estudianteId => ({
                    estudianteId,
                    totalBloques: this.horariosEstudiantes.get(estudianteId)!.metricas.totalBloques,
                    costoTotal: this.horariosEstudiantes.get(estudianteId)!.metricas.costoTotal,
                    cambiosDeSede: this.horariosEstudiantes.get(estudianteId)!.metricas.cambiosDeSede,
                    sedesUsadas: this.horariosEstudiantes.get(estudianteId)!.metricas.sedesUsadas,
                    materiasNoAsignadas: this.horariosEstudiantes.get(estudianteId)!.metricas.materiasNoAsignadas
                }));

                estudiantes.sort((a, b) => a.estudianteId.localeCompare(b.estudianteId));

                res.json({
                    success: true,
                    data: {
                        total: estudiantes.length,
                        estudiantes
                    }
                });
            } catch (error) {
                res.status(500).json({ success: false, error: (error as Error).message });
            }
        });
    }

    private async generateSchedule(algoritmo: AlgoritmoColoreado): Promise<ScheduleResponse> {
        if (this.cache.has(algoritmo)) return this.cache.get(algoritmo)!;

        const input = SchedulerDataLoader.build().getData();
        const { graph } = new ConflictGraphBuilder(input).build();
        const horario = new ScheduleBuilder(graph, input.salones).buildHorario(algoritmo);

        if (!this.horarioGlobal) this.horarioGlobal = horario;

        const response: ScheduleResponse = {
            success: true,
            data: {
                algoritmo,
                grafo: { vertices: graph.getVertex().length, aristas: graph.getEdges().length },
                horario,
            }
        };

        this.cache.set(algoritmo, response);
        return response;
    }

    private async getHorarioGlobal(): Promise<HorarioSemanal> {
        if (this.horarioGlobal) return this.horarioGlobal;
        return (await this.generateSchedule("d-satur")).data!.horario;
    }

    start(): void {
        this.app.listen(this.port, () => {
            console.log(`\n🎓 Scheduler API running on http://localhost:${this.port}`);
            console.log(`   GET  /api/health`);
            console.log(`   GET  /api/schedule?algoritmo=d-satur`);
            console.log(`   GET  /api/schedule/refresh?algoritmo=d-satur`);
            console.log(`   GET  /api/schedule/grafo`);
            console.log(`   GET  /api/schedule/comparar`);
            console.log(`   POST /api/student/schedule`);
            console.log(`   GET  /api/student/schedule/:estudianteId`);
            console.log(`   GET  /api/student/schedules\n`);
        });
    }
}