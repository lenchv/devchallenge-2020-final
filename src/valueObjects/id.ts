import { AppException } from '../exceptions/app.exception';

export class Id {
    public readonly id: string;

    constructor(id: string | Id) {
        if (id instanceof Id) {
            this.id = id.id;
            return;
        }

        if (!id) {
            throw new AppException('id cannot be empty');
        }

        if (typeof id === 'object') {
            throw new AppException('id should have simple type: string, number');
        }

        this.id = String(id);
    }

    toString(): string {
        return this.id;
    }

    valueOf(): string {
        return this.id;
    }

    equalsTo(id: Id): boolean {
        return id.id === this.id;
    }
}
