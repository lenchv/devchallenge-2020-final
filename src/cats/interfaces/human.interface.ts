import { AddressInterface } from './address.interface';

export interface HumanInterface {
    readonly id?: string;
    readonly name: string;
    readonly address?: AddressInterface;
}
