import { FilterQuery } from 'mongoose';
import { Topic } from '../../../valueObjects/topic';
import { Criteria } from '../../criteria';
import { PersonDocument } from '../../../models/person.model';

export class TopicsCriteria implements Criteria<FilterQuery<PersonDocument>> {
    constructor(private topics: Topic[]) {}

    query(filter: FilterQuery<PersonDocument>): FilterQuery<PersonDocument> {
        if (this.topics.length === 0) {
            return filter;
        }

        return {
            ...filter,
            topics: { $all: this.topics.map(String) },
        };
    }
}
