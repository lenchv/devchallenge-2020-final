import { Pixel } from '../value-objects/pixel';

export class Cell {
    constructor(public readonly data: Pixel[][], public readonly width: number, public readonly height: number) {}

    toJSON() {
        return {
            width: this.width,
            height: this.height,
            data: this.data.map((row) => row.map((p) => Number(p.toLevel()))),
        };
    }
}
