export type StopData = {
  kind: "stop";
  stopId: string;
  stopName: string;
  stopLat: number;
  stopLon: number;
};
 
export type SiteData = {
  kind: "site";
  siteId: string;
  name: string;
  lat: number;
  lng: number;
  visitDurationMin: number;
  openingTimeMin: number;
  closingTimeMin: number;
  category: string;
};
export type NodeData = StopData | SiteData;
