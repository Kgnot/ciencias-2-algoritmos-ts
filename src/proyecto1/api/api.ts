import type { RawStop } from "../entity/RawStop.js";
import type { RawTouristSite } from "../entity/RawTouristSite.js";
import type { RawTransition } from "../entity/RawTransition.js";

const BASE_URL = 'http://localhost:8080';


export async function fetchStops(): Promise<RawStop[]> {
  const res = await fetch(`${BASE_URL}/stops/active`);
  if (!res.ok) throw new Error(`/stops/active falló: ${res.status}`);
  return res.json() as Promise<RawStop[]>;
}
 
export async function fetchTransitions(): Promise<RawTransition[]> {
  const res = await fetch(`${BASE_URL}/transitions/grouped`);
  if (!res.ok) throw new Error(`/transitions/grouped falló: ${res.status}`);
  return res.json() as Promise<RawTransition[]>;
}
 
export async function fetchTouristSites(): Promise<RawTouristSite[]> {
  const res = await fetch(`${BASE_URL}/tourist-sites`);
  if (!res.ok) throw new Error(`/tourist-sites falló: ${res.status}`);
  return res.json() as Promise<RawTouristSite[]>;
}