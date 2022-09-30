import { Person } from '../../entities/Person';
import { Id } from '../../valueObjects/id';
import { Criteria } from './criteria';

export class PersonCriteria implements Criteria<Person> {
    constructor(private personIds: Id[]) {}

    query(people: Person[]): Person[] {
        return people.filter((p) => this.personIds.some((id) => p.id.equalsTo(id)));
    }
}
