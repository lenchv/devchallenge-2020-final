import { HttpStatus } from '@nestjs/common';
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { AppException } from './common/exceptions/app.exception';
import { NotFoundException } from './common/exceptions/not-found.exception';

@Catch()
export class AppExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        console.error(exception);

        if (exception instanceof AppException) {
            response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
                message: exception.message,
            });
        } else if (exception instanceof NotFoundException) {
            response.status(HttpStatus.NOT_FOUND).json({
                message: exception.message,
            });
        } else {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: exception.message || 'Something went wrong',
            });
        }
    }
}
