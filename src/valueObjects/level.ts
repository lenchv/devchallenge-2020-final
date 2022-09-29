import { LogicException } from '../exceptions/logic.exception';

export class Level {
  public readonly value: number;

  constructor(value: number) {
    if (isNaN(value)) {
      throw new LogicException('value must be a valid number');
    }
    if (value < 0 || value > 10) {
      throw new LogicException(
        'Level must be greater than 0 and not higher 10',
      );
    }

    this.value = value;
  }

  valueOf() {
    return this.value;
  }
}
