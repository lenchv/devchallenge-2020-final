import { HttpStatus } from '@nestjs/common';
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { LogicException } from './exceptions/logic.exception';

@Catch()
export class AppExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof LogicException) {
            response.status(exception.httpStatus).json({
                message: exception.message,
            });
        } else {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: exception.message || 'Something went wrong',
            });
        }
    }
}
