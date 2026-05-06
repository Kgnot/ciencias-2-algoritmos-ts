import type { Comparable } from "./Comparable.js";

export class PriorityQueue<T extends Comparable<T>> {
    private queue: T[] = [];

    enqueue(item: T): void {
        let added = false;
        for (let i = 0; i < this.queue.length; i++) {
            // Usamos compareTo en lugar de <
            const current = this.queue[i];
            if (current && item.compareTo(current) < 0) {
                this.queue.splice(i, 0, item);
                added = true;
                break;
            }
        }
        if (!added) {
            this.queue.push(item);
        }
    }

    dequeue(): T | undefined {
        return this.queue.shift();
    }

    isEmpty(): boolean {
        return this.queue.length === 0;
    }
}
