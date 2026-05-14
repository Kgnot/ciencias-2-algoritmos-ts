import express from "express";
import { corsMiddleware } from "./middleware/cors.middleware";
import studentRoutes from "./routes/student.routes";
import healthRoutes from "./routes/health.routes";
import scheduleRouters from "./routes/schedule.routers";

export class SchedulerApiServer {
    private readonly app = express();
    private readonly port: number;

    constructor(port: number = 3002) {
        this.port = port;
        this.setupMiddleware();
        this.setupRoutes();
    }

    private setupMiddleware(): void {
        this.app.use(corsMiddleware);
        this.app.use(express.json());
    }

    private setupRoutes(): void {
        this.app.use("/api", healthRoutes);
        this.app.use("/api", scheduleRouters);
        this.app.use("/api", studentRoutes);
    }

    public start(): void {
        this.app.listen(this.port, () => {
            console.log(`\nScheduler API running on http://localhost:${this.port}`);
            console.log(`\nEndpoints:`);
            console.log(`   GET  /api/health`);
            console.log(`   GET  /api/schedule`);
            console.log(`   GET  /api/schedule/grafo`);
            console.log(`   POST /api/student/schedule`);
            console.log(`   GET  /api/student/schedule/:estudianteId`);
            console.log(`   GET  /api/student/schedules\n`);
        });
    }
}