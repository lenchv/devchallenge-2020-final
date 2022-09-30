import { Level } from '../valueObjects/level';
import { Id } from '../valueObjects/id';

export class Relation {
    private readonly _id: Id;
    private readonly _trustLevel: Level;

    constructor(id: string, trustLevel: number) {
        this._id = new Id(id);
        this._trustLevel = new Level(trustLevel);
    }

    get id(): Id {
        return this._id;
    }

    get trustLevel(): Level {
        return this._trustLevel;
    }

    toJSON() {
        return {
            id: String(this.id),
            trustLevel: Number(this.trustLevel),
        };
    }
}
