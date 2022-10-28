import { Level } from './level';

export class Pixel {
    constructor(
        public readonly r: number,
        public readonly g: number,
        public readonly b: number,
        public readonly alpha: number,
    ) {}

    toLevel(): Level {
        const value = (this.r + this.g + this.b) / 3;

        return new Level(((255 - value) / 255) * 100);
    }
}
