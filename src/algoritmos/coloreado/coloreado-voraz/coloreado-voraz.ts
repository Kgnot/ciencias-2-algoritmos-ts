import { ColoredGraphAlgorithm } from "../coloreado.abstract";
import { COLOR } from "../../../estructuras/vertex";

export class ColoreadorVoraz<T> extends ColoredGraphAlgorithm<T> {


    constructor(graph: any, customColors?: (COLOR | string)[]) {
        super(graph, customColors);
        this.run();
    }

    protected run(): void {
        if (this.ran) return;
        this.ran = true;

        const vertices = this.graph.getVertex();

        for (const vertex of vertices) {
            const usedColors = new Set<COLOR | string>();
            const neighbors = this.adjList.get(vertex.id) ?? [];

            for (const edge of neighbors) {
                const adj = edge.from.id === vertex.id ? edge.to.id : edge.from.id;
                const c = this.colorMap.get(adj);
                if (c && c !== COLOR.WHITE) {
                    usedColors.add(c);
                }
            }

            let i = 0;
            let color = this.getColorByIndex(i);

            while (usedColors.has(color)) {
                i++;
                color = this.getColorByIndex(i);
            }

            this.colorMap.set(vertex.id, color);
            vertex.setColor(color);
            this.numColors = Math.max(this.numColors, this.getColorIndex(color) + 1);
        }
    }
}