import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CatsRepository } from 'src/cats/repositories/cats.repository';
import { createTestingApp } from './helpers/create-testing-app';
import { DbTestService } from './helpers/DbTestService';
import { Id } from 'src/common/valueObjects/id';
import { Cat } from 'src/cats/entities/cat.entity';

describe('Cats (e2e)', () => {
    let app: INestApplication;
    let catsRepo: CatsRepository;
    let dbService: DbTestService;

    beforeAll(async () => {
        app = await createTestingApp();
        await app.init();
        catsRepo = app.get(CatsRepository);
    });

    beforeEach(async () => {
        dbService = app.get(DbTestService);
        await dbService.runMigrations();
    });

    afterEach(async () => {
        dbService = app.get(DbTestService);
        await dbService.dropDatabase();
    });

    afterAll(async () => {
        await app.close();
    });

    it('POST /cats/ success', async () => {
        const result = await request(app.getHttpServer()).post('/cats').send({ name: 'puffy' }).expect(201);
        expect(result.body).toMatchObject({ name: 'puffy' });
        const cat = await catsRepo.findById(new Id(result.body.id));
        expect(cat.name).toEqual('puffy');
    });

    it('GET /cats/:id success', async () => {
        const cat = new Cat(new Id('1'), 'murzik');
        await catsRepo.add(cat);
        await request(app.getHttpServer()).get('/cats/1').expect(200).expect({
            id: '1',
            name: 'murzik',
        });
    });
});
