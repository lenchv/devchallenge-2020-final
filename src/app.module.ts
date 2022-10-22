import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppExceptionsFilter } from './app-exceptions.filter';
import { AppController } from './app.controller';
import { CatsModule } from './cats/cats.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConfig } from 'config/database.config';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                ...getConfig(configService),
                entities: [],
            }),
            inject: [ConfigService],
        }),
        CatsModule,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_FILTER,
            useClass: AppExceptionsFilter,
        },
    ],
})
export class AppModule {}
