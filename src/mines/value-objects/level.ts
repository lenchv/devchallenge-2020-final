import { AppException } from 'src/mines/exceptions/app.exception';

export class Level {
    public readonly level: number;

    constructor(level: number | Level) {
        if (level instanceof Level) {
            this.level = Number(level);
            return;
        }

        if (level < 0) {
            throw new AppException('level must be greater or equal than 0');
        }

        if (level > 100) {
            throw new AppException('level must be less or equal than 100');
        }

        this.level = Math.round(level);
    }

    valueOf(): number {
        return this.level;
    }

    equalsTo(level: Level): boolean {
        return Number(level) === this.level;
    }
}
