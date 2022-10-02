import { Id } from '../../../valueObjects/id';
import { Criteria } from '../../criteria';

export class PersonCriteria implements Criteria<string> {
    constructor(private personIds: Id[]) {}

    query(filter: string): string {
        return `n.id IN ["${this.personIds.join('", "')}"]`;
    }
}
