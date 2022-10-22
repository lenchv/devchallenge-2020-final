import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CatsModule } from 'src/cats/cats.module';

describe('Cats (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [CatsModule],
            exports: [],
        }).compile();

        app = moduleFixture.createNestApplication();
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
