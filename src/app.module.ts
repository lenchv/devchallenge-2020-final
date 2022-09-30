import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppExceptionsFilter } from './app-exceptions.filter';
import { AppController } from './app.controller';
import { PeopleRepository } from './repositories/people.repository';
import { MessageService } from './services/message.service';
import { NotificationService } from './services/notification.service';
import { PeopleService } from './services/people.service';

@Module({
    imports: [],
    controllers: [AppController],
    providers: [
        MessageService,
        NotificationService,
        PeopleService,
        PeopleRepository,
        {
            provide: APP_FILTER,
            useClass: AppExceptionsFilter,
        },
    ],
})
export class AppModule {}
