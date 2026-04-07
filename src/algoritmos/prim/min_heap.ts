export class MinHeap<T> {
    private heap: { priority: number; value: T }[] = [];

    push(value: T, priority: number): void {
        this.heap.push({ priority, value });
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): T | undefined {
        if (this.heap.length === 0) return undefined;
        const top = this.heap[0]!.value;
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return top;
    }

    get size(): number {
        return this.heap.length;
    }

    private bubbleUp(i: number): void {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.heap[parent]!.priority <= this.heap[i]!.priority) break;
            [this.heap[parent], this.heap[i]] = [this.heap[i]!, this.heap[parent]!];
            i = parent;
        }
    }

    private sinkDown(i: number): void {
        const n = this.heap.length;
        while (true) {
            let smallest = i;
            const l = 2 * i + 1;
            const r = 2 * i + 2;
            if (l < n && this.heap[l]!.priority < this.heap[smallest]!.priority) smallest = l;
            if (r < n && this.heap[r]!.priority < this.heap[smallest]!.priority) smallest = r;
            if (smallest === i) break;
            [this.heap[smallest], this.heap[i]] = [this.heap[i]!, this.heap[smallest]!];
            i = smallest;
        }
    }
}