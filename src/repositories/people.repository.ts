import { Level } from '../valueObjects/level';
import { Topic } from '../valueObjects/topic';
import { Person } from '../entities/person';
import { Relation } from '../entities/relation';
import { Id } from '../valueObjects/id';
import { Criteria } from './criteria';

export interface PeopleRepository {
    findById(id: Id): Promise<Person | undefined>;

    addPerson(person: Person): Promise<Person>;

    updatePerson(person: Person): Promise<Person>;

    addPeople(people: Person[]): Promise<void>;

    addRelations(person: Person, relations: Relation[]): Promise<Person>;

    findByCriteria(criterions: Criteria<any>[]): Promise<Person[]>;

    queryGraphForBroadcast(topics: Topic[], minTrustLevel: Level): Promise<Person[]>;

    getShortestPathIterator(
        personId: Id,
        topics: Topic[],
        minTrustLevel: Level,
    ): Promise<(id: []) => Promise<Person[]>>;

    wipe(): Promise<void>;
}
