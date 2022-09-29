import { LogicException } from '../exceptions/logic.exception';

export class Topic {
  public readonly value: string;

  constructor(value: string) {
    if (!value) {
      throw new LogicException('topic cannot be empty');
    }

    if (typeof value !== 'string') {
      throw new LogicException('topic must be string');
    }

    this.value = String(value);
  }

  toString() {
    return this.value;
  }
}
