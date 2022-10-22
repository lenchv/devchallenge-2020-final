import { Id } from '../valueObjects/id';
import { Criteria } from './criteria';

export interface Repository<T> {
    findById(id: Id): Promise<T | undefined>;

    add(entity: T): Promise<T>;

    update(entity: T): Promise<T>;

    findByCriteria(criterions: Criteria<any>[]): Promise<T[]>;

    delete(id: Id): Promise<void>;
}
