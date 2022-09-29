import { LogicException } from '../exceptions/logic.exception';
import { Relation } from './relation';

export class Person {
  id: string;
  topics: string[];
  pairs?: Relation[];

  constructor(id: string, topics: string[]) {
    this.setId(id);
    this.setTopics(topics);
  }

  setId(id: string): void {
    if (!id) {
      throw new LogicException('id cannot be empty');
    }

    if (typeof id === 'object') {
      throw new LogicException('id should have simple type: string, number');
    }

    this.id = String(id);
  }

  setTopics(topics: string[]): void {
    const isArrayOfStrings = (values: string[]): boolean =>
      values.every((value) => typeof value === 'string');

    if (!Array.isArray(topics) || !isArrayOfStrings(topics)) {
      throw new LogicException('topics must be an array of strings');
    }

    if (!topics.length) {
      throw new LogicException('topics cannot be empty');
    }

    this.topics = topics;
  }
}
