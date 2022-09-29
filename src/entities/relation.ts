import { Level } from '../valueObjects/level';
import { Id } from '../valueObjects/id';

export class Relation {
  private readonly _id: Id;
  private readonly _trustLevel: Level;

  constructor(id: string, trustLevel: number) {
    this._id = new Id(id);
    this._trustLevel = new Level(trustLevel);
  }

  get id(): string {
    return String(this._id);
  }

  get trustLevel(): number {
    return Number(this._trustLevel);
  }

  toJSON() {
    return {
      id: this.id,
      trustLevel: this.trustLevel,
    };
  }
}
