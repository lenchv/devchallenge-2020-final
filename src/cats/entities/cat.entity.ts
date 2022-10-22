import { Id } from 'src/common/valueObjects/id';

export class Cat {
    constructor(public readonly id: Id, public readonly name: string) {}

    toJSON() {
        return {
            id: String(this.id),
            name: this.name,
        };
    }
}
