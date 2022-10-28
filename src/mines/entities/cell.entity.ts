import { Pixel } from '../value-objects/pixel';

export class Cell {
    constructor(public readonly data: Pixel[][], public readonly width: number, public readonly height: number) {}
}
