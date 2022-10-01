import { Topic } from '../../../valueObjects/topic';
import { Person } from '../../../entities/Person';
import { Criteria } from '../../criteria';

export class TopicsCriteria implements Criteria<Person[]> {
    constructor(private topics: Topic[]) {}

    query(people: Person[]): Person[] {
        return people.filter((p) => this.topics.every((topic) => p.topics.some((t) => t.equalsTo(topic))));
    }
}
