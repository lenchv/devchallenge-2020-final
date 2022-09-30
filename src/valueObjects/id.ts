import { LogicException } from '../exceptions/logic.exception';

export class Id {
    public readonly id: string;

    constructor(id: string) {
        if (!id) {
            throw new LogicException('id cannot be empty');
        }

        if (typeof id === 'object') {
            throw new LogicException('id should have simple type: string, number');
        }

        this.id = String(id);
    }

    toString(): string {
        return this.id;
    }

    equalsTo(id: Id): boolean {
        return id.id === this.id;
    }
}
