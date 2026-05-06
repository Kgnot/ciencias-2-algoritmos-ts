export interface RawTouristSite {
  id: string;
  name: string;
  lat: number;
  lng: number;
  visitDurationMin: number;
  openingTimeMin: number;  // minutos desde medianoche. Ej: 480 = 08:00
  closingTimeMin: number;  // Ej: 1140 = 19:00
  category: "viewpoint" | "museum" | "plaza" | "park" | "market";
}
 