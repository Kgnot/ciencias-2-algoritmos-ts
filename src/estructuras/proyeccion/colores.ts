import type {Graph} from "../graph/graph.js";
import {COLOR} from "../vertex.js";

/**
 * Mapeo de números a colores disponibles
 */
const COLORES_DISPONIBLES: COLOR[] = [
    COLOR.RED,
    COLOR.GREEN,
    COLOR.BLUE,
    COLOR.YELLOW,
    COLOR.ORANGE,
    COLOR.PURPLE,
    COLOR.CYAN,
    COLOR.MAGENTA,
    COLOR.BLACK,
];

/**
 * Convierte un mapa de números a colores y los asigna a los vértices del grafo
 * @param coloresMap - Map de vertexId -> número de color
 * @param graph - Grafo para asignar colores a vértices
 */
export function aplicarColoresAlGrafo<T>(
    coloresMap: Map<string, COLOR | string>,
    graph: Graph<string>
): void {
    for (const [vertexId, numeroColor] of coloresMap) {
        const vertex = graph.getVertexById(vertexId);
        const color = COLORES_DISPONIBLES[numeroColor % COLORES_DISPONIBLES.length];
        vertex.setColor(color || COLOR.WHITE); // Asignar color al vértice
    }
}

/**
 * Obtiene una representación visual de los colores asignados
 * @param graph - Grafo con colores asignados
 * @returns String formateado con los vértices y sus colores
 */
export function obtenerRepresentacionColores<T>(graph: Graph<T>): string {
    let resultado = "Asignación de Colores:\n";

    const vertices = graph.getVertex();
    const porColor = new Map<COLOR | string, string[]>();

    for (const vertex of vertices) {
        const color: COLOR | string = vertex.getColor();
        if (!porColor.has(color)) {
            porColor.set(color, []);
        }
        porColor.get(color)!.push(vertex.id.value);
    }

    for (const [color, vertexIds] of porColor) {
        resultado += `  [${color}]: ${vertexIds.join(", ")}\n`;
    }

    return resultado;
}

/**
 * Proyección de coloración: convierte resultados de algoritmo a representación visual
 */
export function toColoresVisuales<T>(
    coloresMap: Map<string, COLOR | string>,
): Map<number, string[]> {
    const grupos = new Map<number, string[]>();

    for (const [vertexId, color] of coloresMap) {
        if (!grupos.has(color)) {
            grupos.set(color, []);
        }
        grupos.get(color)!.push(vertexId);
    }

    return grupos;
}
