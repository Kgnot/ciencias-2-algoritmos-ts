import express, { type Request, type Response } from "express";
import { ScheduleBuilder, type HorarioSemanal } from "../logic/scheduler-builder.js";
import { ConflictGraphBuilder } from "../logic/conflict-graph.logic.js";
import { SchedulerDataLoader } from "../data/scheduler-data-loader.js";

export interface ScheduleResponse {
  success: boolean;
  data: {
    grafo: {
      vertices: number;
      aristas: number;
    };
    horario: HorarioSemanal;
  };
  error?: string;
}

export class SchedulerApiServer {
  private readonly app = express();
  private readonly port: number;
  private cachedSchedule: ScheduleResponse | null = null;

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

    this.app.get("/api/schedule", async (_req: Request, res: Response) => {
      try {
        const schedule = await this.generateSchedule();
        res.json(schedule);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        res.status(500).json({
          success: false,
          error: message
        } as ScheduleResponse);
      }
    });

    this.app.get("/api/schedule/refresh", async (_req: Request, res: Response) => {
      try {
        this.cachedSchedule = null;
        const schedule = await this.generateSchedule();
        res.json(schedule);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        res.status(500).json({
          success: false,
          error: message
        } as ScheduleResponse);
      }
    });

    this.app.get("/api/schedule/grafo", async (_req: Request, res: Response) => {
      try {
        const loader = SchedulerDataLoader.build();
        const scheduleInput = loader.getData();
        const { graph } = new ConflictGraphBuilder(scheduleInput).build();

        res.json({
          success: true,
          data: {
            vertices: graph.getVertex().length,
            aristas: graph.getEdges().length
          }
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        res.status(500).json({
          success: false,
          error: message
        });
      }
    });
  }

  private async generateSchedule(): Promise<ScheduleResponse> {
    if (this.cachedSchedule) {
      return this.cachedSchedule;
    }

    const loader = SchedulerDataLoader.build();
    const scheduleInput = loader.getData();

    const { graph } = new ConflictGraphBuilder(scheduleInput).build();

    const scheduleBuilder = new ScheduleBuilder(graph, scheduleInput.salones);
    const horario = scheduleBuilder.buildHorario();

    this.cachedSchedule = {
      success: true,
      data: {
        grafo: {
          vertices: graph.getVertex().length,
          aristas: graph.getEdges().length
        },
        horario
      }
    };

    return this.cachedSchedule;
  }

  start(): void {
    this.app.listen(this.port, () => {
      console.log(`\nScheduler API running on http://localhost:${this.port}`);
      console.log(`GET http://localhost:${this.port}/api/schedule`);
      console.log(`GET http://localhost:${this.port}/api/schedule/refresh`);
      console.log(`GET http://localhost:${this.port}/api/schedule/grafo`);
      console.log(`GET http://localhost:${this.port}/api/health\n`);
    });
  }
}