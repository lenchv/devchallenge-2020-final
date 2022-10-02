import { Person } from '../entities/Person';
import { Relation } from '../entities/relation';
import { Id } from '../valueObjects/id';
import { Criteria } from './criteria';

export interface PeopleRepository {
    findById(id: Id): Promise<Person | undefined>;

    addPerson(person: Person): Promise<Person>;

    addPeople(people: Person[]): Promise<void>;

    addRelations(person: Person, relations: Relation[]): Promise<Person>;

    findByCriteria<T>(criterions: Criteria<T>[]): Promise<Person[]>;

    wipe(): Promise<void>;
}
