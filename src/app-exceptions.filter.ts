import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { LogicException } from './exceptions/logic.exception';

@Catch()
export class AppExceptionsFilter implements ExceptionFilter {
  catch(exception: LogicException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(exception.httpStatus).json({
      message: exception.message,
    });
  }
}
