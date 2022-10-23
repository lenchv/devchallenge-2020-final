import { Id } from 'src/common/valueObjects/id';
import { Address } from './address.entity';

export class Human {
    constructor(public readonly id: Id, public readonly name: string, public address?: Address) {}

    setAddress(address: Address): void {
        this.address = address;
    }

    toJSON() {
        return {
            id: String(this.id),
            name: this.name,
            address: this.address?.toJSON() || null,
        };
    }
}
