import type { VertexID } from "../../../estructuras/vertex.js";

export class UnionFind {
    private parent: Map<VertexID, VertexID> = new Map();
    private rank: Map<VertexID, number> = new Map();

    constructor(ids: VertexID[]) {
        for (const id of ids) {
            this.parent.set(id, id);
            this.rank.set(id, 0);
        }
    }

    find(x: VertexID): VertexID {
        if (this.parent.get(x) !== x) {
            // compresión de camino
            this.parent.set(x, this.find(this.parent.get(x)!));
        }
        return this.parent.get(x)!;
    }

    union(a: VertexID, b: VertexID): boolean {
        const ra = this.find(a);
        const rb = this.find(b);

        if (ra === rb) return false; // ya en el mismo componente → ciclo

        // unión por rango
        if (this.rank.get(ra)! < this.rank.get(rb)!) {
            this.parent.set(ra, rb);
        } else if (this.rank.get(ra)! > this.rank.get(rb)!) {
            this.parent.set(rb, ra);
        } else {
            this.parent.set(rb, ra);
            this.rank.set(ra, this.rank.get(ra)! + 1);
        }

        return true;
    }

    same(a: string, b: string): boolean {
        return this.find(a) === this.find(b);
    }
}