import { HumanInterface } from './human.interface';

export interface CatInterface {
    readonly id?: string;
    readonly name: string;
    readonly owner?: HumanInterface;
}
