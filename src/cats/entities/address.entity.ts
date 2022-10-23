import { Id } from 'src/common/valueObjects/id';

export class Address {
    constructor(
        public readonly id: Id,
        public readonly city: string,
        public readonly street: string,
        public readonly home: string,
    ) {}

    toJSON() {
        return {
            id: String(this.id),
            city: this.city,
            street: this.street,
            home: this.home,
        };
    }
}
