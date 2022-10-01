import { FilterQuery } from 'mongoose';
import { PersonDocument } from '../../../models/person.model';
import { Id } from '../../../valueObjects/id';
import { Criteria } from '../../criteria';

export class PersonCriteria implements Criteria<FilterQuery<PersonDocument>> {
    constructor(private personIds: Id[]) {}

    query(filter: FilterQuery<PersonDocument>): FilterQuery<PersonDocument> {
        return {
            ...filter,
            id: { $in: this.personIds.map(String) },
        };
    }
}
