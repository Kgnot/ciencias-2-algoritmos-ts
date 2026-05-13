import express, {type Request, type Response} from "express";
import {ScheduleBuilder, type HorarioSemanal} from "../logic/scheduler-builder.js";
import {SchedulerDataLoader} from "../data/scheduler-data-loader.js";
import type {AlgoritmoColoreado} from "../logic/schedule-solver.js";
import {ConflictGraphBuilder} from "../logic/conflict-graph/conflict-graph-builder.js";

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
    private readonly app = express();
    private readonly port: number;

    // Cache por algoritmo para no recalcular
    private readonly cache = new Map<string, ScheduleResponse>();

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
            res.json({ok: true, timestamp: new Date().toISOString()});
        });

        // GET /api/schedule?algoritmo=d-satur (por defecto d-satur)
        this.app.get("/api/schedule", async (req: Request, res: Response) => {
            const algoritmo = (req.query["algoritmo"] as AlgoritmoColoreado) ?? "d-satur";
            try {
                const schedule = await this.generateSchedule(algoritmo);
                res.json(schedule);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : "Error desconocido"
                });
            }
        });

        // GET /api/schedule/refresh?algoritmo=d-satur — limpia cache del algoritmo
        this.app.get("/api/schedule/refresh", async (req: Request, res: Response) => {
            const algoritmo = (req.query["algoritmo"] as AlgoritmoColoreado) ?? "d-satur";
            this.cache.delete(algoritmo);
            try {
                const schedule = await this.generateSchedule(algoritmo);
                res.json(schedule);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : "Error desconocido"
                });
            }
        });

        // GET /api/schedule/grafo — solo stats del grafo
        this.app.get("/api/schedule/grafo", async (_req: Request, res: Response) => {
            try {
                const loader = SchedulerDataLoader.build();
                const input = loader.getData();
                const {graph} = new ConflictGraphBuilder(input).build();

                res.json({
                    success: true,
                    data: {
                        vertices: graph.getVertex().length,
                        aristas: graph.getEdges().length,
                    }
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : "Error desconocido"
                });
            }
        });

        // GET /api/schedule/comparar — corre los 3 algoritmos y devuelve resumen
        this.app.get("/api/schedule/comparar", async (_req: Request, res: Response) => {
            try {
                const loader = SchedulerDataLoader.build();
                const input = loader.getData();
                const algoritmos: AlgoritmoColoreado[] = ["voraz", "welsh-powell", "d-satur"];
                const resultados: Record<string, { salones: number }> = {};

                for (const alg of algoritmos) {
                    // Grafo fresco por algoritmo — evita contaminación de setColor()
                    const {graph} = new ConflictGraphBuilder(input).build();
                    const builder = new ScheduleBuilder(graph, input.salones);
                    const horario = builder.buildHorario(alg);

                    const salonesUsados = new Set<string>();
                    for (const dia of Object.values(horario)) {
                        for (const clases of Object.values(dia)) {
                            for (const c of clases) {
                                if (c.salon !== "Sin asignar") salonesUsados.add(c.salon);
                            }
                        }
                    }

                    resultados[alg] = {salones: salonesUsados.size};
                }

                res.json({success: true, data: resultados});
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : "Error desconocido"
                });
            }
        });
    }

    private async generateSchedule(algoritmo: AlgoritmoColoreado): Promise<ScheduleResponse> {
        if (this.cache.has(algoritmo)) {
            return this.cache.get(algoritmo)!;
        }

        const loader = SchedulerDataLoader.build();
        const input = loader.getData();
        const {graph} = new ConflictGraphBuilder(input).build();

        const builder = new ScheduleBuilder(graph, input.salones);
        const horario = builder.buildHorario(algoritmo);

        const response: ScheduleResponse = {
            success: true,
            data: {
                algoritmo,
                grafo: {
                    vertices: graph.getVertex().length,
                    aristas: graph.getEdges().length,
                },
                horario,
            }
        };

        this.cache.set(algoritmo, response);
        return response;
    }

    start(): void {
        this.app.listen(this.port, () => {
            console.log(`\n Scheduler API → http://localhost:${this.port}`);
            console.log(`   GET /api/health`);
            console.log(`   GET /api/schedule?algoritmo=d-satur`);
            console.log(`   GET /api/schedule?algoritmo=welsh-powell`);
            console.log(`   GET /api/schedule?algoritmo=voraz`);
            console.log(`   GET /api/schedule/refresh?algoritmo=d-satur`);
            console.log(`   GET /api/schedule/grafo`);
            console.log(`   GET /api/schedule/comparar\n`);
        });
    }
}