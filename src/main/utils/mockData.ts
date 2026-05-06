import type { RawTouristSite } from "../entity/RawTouristSite.js";

export const mockTouristSites: RawTouristSite[] = [
  {
    id: "site-01",
    name: "Monserrate",
    lat: 4.6057,
    lng: -74.055,
    visitDurationMin: 120,
    openingTimeMin: 480,
    closingTimeMin: 1140,
    category: "viewpoint",
  },
  {
    id: "site-02",
    name: "Museo del Oro",
    lat: 4.6019,
    lng: -74.0739,
    visitDurationMin: 90,
    openingTimeMin: 540,
    closingTimeMin: 1080,
    category: "museum",
  },
  {
    id: "site-03",
    name: "Jardin Botanico",
    lat: 4.6676,
    lng: -74.1015,
    visitDurationMin: 75,
    openingTimeMin: 510,
    closingTimeMin: 1050,
    category: "park",
  },
  {
    id: "site-04",
    name: "Mercado de Paloquemao",
    lat: 4.6249,
    lng: -74.0896,
    visitDurationMin: 60,
    openingTimeMin: 360,
    closingTimeMin: 900,
    category: "market",
  },
];
