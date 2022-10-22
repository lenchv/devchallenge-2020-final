import { HttpStatus } from '@nestjs/common';
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { AppException } from './common/exceptions/app.exception';
import { NotFoundException } from './common/exceptions/not-found.exception';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AppExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    catch(exception: any, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        console.error(exception);

        if (exception instanceof AppException) {
            httpAdapter.reply(response, { message: exception.message }, HttpStatus.UNPROCESSABLE_ENTITY);
        } else if (exception instanceof NotFoundException) {
            httpAdapter.reply(response, { message: exception.message }, HttpStatus.NOT_FOUND);
        } else {
            httpAdapter.reply(
                response,
                { message: exception.message || 'Something went wrong' },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
