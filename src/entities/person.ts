import { Id } from '../valueObjects/id';
import { Topic } from '../valueObjects/topic';
import { LogicException } from '../exceptions/logic.exception';
import { Relation } from './relation';

export class Person {
    private _id: Id;
    private _topics: Topic[];
    private _pairs: Relation[] = [];

    constructor(id: string, topics: string[]) {
        this._id = new Id(id);
        this.setTopics(topics);
    }

    setTopics(topics: string[]): void {
        if (!Array.isArray(topics)) {
            throw new LogicException('topics must be an array of strings');
        }

        if (!topics.length) {
            throw new LogicException('topics cannot be empty');
        }

        this._topics = topics.map((topic) => new Topic(topic));
    }

    get pairs(): Relation[] {
        return this._pairs;
    }

    get id(): Id {
        return this._id;
    }

    get topics(): Topic[] {
        return this._topics;
    }

    addRelation(relation: Relation): void {
        this._pairs.push(relation);
    }

    toJSON() {
        return {
            id: String(this._id),
            topics: this._topics.map((topic) => String(topic)),
            relations: this._pairs.map((r) => r.toJSON()),
        };
    }
}
