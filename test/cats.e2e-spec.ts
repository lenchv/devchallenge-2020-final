import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CatsModule } from 'src/cats/cats.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConfig } from '../config/database.config';
import { CatsRepository } from 'src/cats/repositories/cats.repository';
import { CatModel } from 'src/cats/models/cat.model';

describe('Cats (e2e)', () => {
    let app: INestApplication;
    let catsRepo: CatsRepository;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ envFilePath: __dirname + '/../.env.testing' }),
                TypeOrmModule.forRootAsync({
                    imports: [ConfigModule],
                    useFactory: (configService: ConfigService) => ({
                        ...getConfig(configService),
                        entities: [],
                        autoLoadEntities: true,
                    }),
                    inject: [ConfigService],
                }),
                CatsModule,
                TypeOrmModule.forFeature([CatModel]),
            ],
            exports: [],
            providers: [CatsRepository],
        }).compile();

        app = moduleFixture.createNestApplication();
        catsRepo = app.get(CatsRepository);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('POST /api/people/ success', async () => {
        const result = await request(app.getHttpServer()).post('/cats').send({ name: 'puffy' }).expect(201);
        expect(result.body).toMatchObject({ name: 'puffy' });
    });
});
