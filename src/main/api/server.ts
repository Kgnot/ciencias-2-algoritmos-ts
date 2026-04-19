import express, { type Request, type Response } from "express";
import type { BogotaGraph } from "../graph_builder/BogotaGraph.js";
import {
  BogotaGraphInitializer,
  createBogotaGraphInitializer,
} from "../graph_builder/initializeBogotaGraph.js";
import { GraphSerializer } from "./graphSerializer.js";

export class GraphApiServer {
  private readonly app = express();
  private cachedGraph: BogotaGraph | null = null;

  constructor(
    private readonly port: number = 3001,
    private readonly initializer: BogotaGraphInitializer = createBogotaGraphInitializer()
  ) {
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
      res.json({ ok: true });
    });

    this.app.get("/api/graph", async (_req: Request, res: Response) => {
      try {
        const graph = await this.getGraph();
        const serializer = new GraphSerializer();
        res.json(serializer.serialize(graph));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        res.status(500).json({ message });
      }
    });
  }

  private async getGraph(): Promise<BogotaGraph> {
    if (!this.cachedGraph) {
      this.cachedGraph = await this.initializer.initialize();
    }
    return this.cachedGraph;
  }

  start(): void {
    this.app.listen(this.port, () => {
      console.log(`Graph API running on http://localhost:${this.port}`);
    });
  }
}

new GraphApiServer().start();
