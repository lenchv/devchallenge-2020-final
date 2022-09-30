import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppExceptionsFilter } from './app-exceptions.filter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PeopleRepository } from './repositories/people.repository';
import { PeopleService } from './services/people.service';

@Module({
    imports: [],
    controllers: [AppController],
    providers: [
        AppService,
        PeopleService,
        PeopleRepository,
        {
            provide: APP_FILTER,
            useClass: AppExceptionsFilter,
        },
    ],
})
export class AppModule {}
