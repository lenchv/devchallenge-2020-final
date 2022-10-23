import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { getConfig } from '../../config/database.config';
import { CatsModule } from 'src/cats/cats.module';
import { DbTestService } from './DbTestService';
import { readMigrations } from '../../database/read-migrations';

export const createTestingApp = async (): Promise<INestApplication> => {
    const migrations = await readMigrations();
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
            ConfigModule.forRoot({ envFilePath: __dirname + '/../../.env.testing' }),
            TypeOrmModule.forRootAsync({
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    ...getConfig(configService),
                    entities: [],
                    migrations: migrations,
                    migrationsRun: true,
                    autoLoadEntities: true,
                }),
                inject: [ConfigService],
            }),
            CatsModule,
        ],
        exports: [],
        providers: [DbTestService],
    }).compile();

    return moduleFixture.createNestApplication();
};
