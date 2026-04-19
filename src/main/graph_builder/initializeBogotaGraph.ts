import type { BogotaGraph } from "./BogotaGraph.js";
import { BogotaGraphBuilder } from "./buildBogotaGraph.js";
import type { BuildGraphOptions } from "./buildBogotaGraph.js";
import type { GraphDataSource } from "./loadData.js";
import { ApiWithMockSitesDataSource } from "./loadData.js";

export class BogotaGraphInitializer {
  constructor(
    private readonly dataSource: GraphDataSource = new ApiWithMockSitesDataSource(),
    private readonly builder: BogotaGraphBuilder = new BogotaGraphBuilder()
  ) {}

  async initialize(): Promise<BogotaGraph> {
    const [stops, transitions, touristSites] = await Promise.all([
      this.dataSource.loadStops(),
      this.dataSource.loadTransitions(),
      this.dataSource.loadTouristSites(),
    ]);

    return this.builder.build(stops, transitions, touristSites);
  }
}

export function createBogotaGraphInitializer(options?: BuildGraphOptions): BogotaGraphInitializer {
  const dataSource = new ApiWithMockSitesDataSource();
  const builder = new BogotaGraphBuilder(options);
  return new BogotaGraphInitializer(dataSource, builder);
}
