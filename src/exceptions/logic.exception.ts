import { HttpStatus } from '@nestjs/common';

export class LogicException {
    constructor(
        public readonly message: string,
        public readonly httpStatus: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY,
    ) {}
}
