import { Id } from 'src/common/valueObjects/id';
import { Human } from './human.entity';

export class Cat {
    constructor(public readonly id: Id, public readonly name: string, public owner?: Human) {}

    addOwner(human: Human) {
        this.owner = human;
    }

    toJSON() {
        return {
            id: String(this.id),
            name: this.name,
            owner: this.owner?.toJSON() || null,
        };
    }
}
