import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppExceptionsFilter } from './app-exceptions.filter';
import { AppController } from './app.controller';
import { CatsModule } from './cats/cats.module';

@Module({
    imports: [ConfigModule.forRoot(), CatsModule],
    controllers: [AppController],
    providers: [
        {
            provide: APP_FILTER,
            useClass: AppExceptionsFilter,
        },
    ],
})
export class AppModule {}
