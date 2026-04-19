import { haversineKm, walkingMinutes } from "./haversineKm.js";

/**
 * Para un sitio turístico, encuentra las N paradas más cercanas
 * dentro de un radio de caminata máximo.
 *
 * @param siteLat   Latitud del sitio turístico
 * @param siteLng   Longitud del sitio turístico
 * @param stops     Todas las paradas activas del backend
 * @param maxWalkMin Máximo de minutos caminando aceptable (default 15)
 * @param topN      Cuántas paradas retornar (default 3)
 */
export function findNearestStops(
    siteLat: number,
    siteLng: number,
    stops: Array<{ stopId: string; stopLat: number; stopLon: number }>,
    maxWalkMin = 15,
    topN = 3
): Array<{ stopId: string; walkMin: number }> {
    return stops
        .map((s) => ({
            stopId: s.stopId,
            walkMin: walkingMinutes(haversineKm(siteLat, siteLng, s.stopLat, s.stopLon)),
        }))
        .filter((x) => x.walkMin <= maxWalkMin)
        .sort((a, b) => a.walkMin - b.walkMin)
        .slice(0, topN);
}