import {COLOR} from "../../estructuras/vertex.js";

export interface ColoredGraphAlgorithm {
    getVertexColor(vertexId: string): COLOR | string;

    getColors(): Map<string, COLOR | string>;

    getNumColors(): number;

    getVertexByColor():Map<COLOR | string, string[]>;

    isValid(): boolean;
}