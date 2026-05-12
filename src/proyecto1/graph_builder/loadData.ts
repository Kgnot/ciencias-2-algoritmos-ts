import type { RawStop } from "../entity/RawStop.js";
import type { RawTransition } from "../entity/RawTransition.js";
import type { RawTouristSite } from "../entity/RawTouristSite.js";
import { fetchStops, fetchTransitions } from "../api/api.js";
import { mockTouristSites } from "../utils/mockData.js";

export interface GraphDataSource {
  loadStops(): Promise<RawStop[]>;
  loadTransitions(): Promise<RawTransition[]>;
  loadTouristSites(): Promise<RawTouristSite[]>;
}

export class ApiWithMockSitesDataSource implements GraphDataSource {
  async loadStops(): Promise<RawStop[]> {
    return fetchStops();
  }

  async loadTransitions(): Promise<RawTransition[]> {
    return fetchTransitions();
  }

  async loadTouristSites(): Promise<RawTouristSite[]> {
    return Promise.resolve(mockTouristSites);
  }
}
