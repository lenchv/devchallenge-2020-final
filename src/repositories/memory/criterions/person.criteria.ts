import { Person } from '../../../entities/person';
import { Id } from '../../../valueObjects/id';
import { Criteria } from '../../criteria';

export class PersonCriteria implements Criteria<Person[]> {
    constructor(private personIds: Id[]) {}

    query(people: Person[]): Person[] {
        return this.personIds.map((id) => people.find((p) => p.id.equalsTo(id)));
    }
}
