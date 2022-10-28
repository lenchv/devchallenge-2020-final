import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppExceptionsFilter } from './app-exceptions.filter';
import { AppController } from './app.controller';
import { MinesModule } from './mines/mines.module';

@Module({
    imports: [MinesModule],
    controllers: [AppController],
    providers: [
        {
            provide: APP_FILTER,
            useClass: AppExceptionsFilter,
        },
    ],
})
export class AppModule {}
