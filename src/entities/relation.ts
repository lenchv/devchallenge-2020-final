import { Level } from '../valueObjects/level';
import { Id } from '../valueObjects/id';

export class Relation {
    private _id: Id;
    private _trustLevel: Level;

    constructor(id: string | Id, trustLevel: number | Level) {
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
