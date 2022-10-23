import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CatsRepository } from 'src/cats/repositories/cats.repository';
import { createTestingApp } from './helpers/create-testing-app';
import { DbTestService } from './helpers/DbTestService';
import { Id } from 'src/common/valueObjects/id';
import { Cat } from 'src/cats/entities/cat.entity';
import { HumansRepository } from 'src/cats/repositories/humans.repository';
import { Human } from 'src/cats/entities/human.entity';

describe('Cats (e2e)', () => {
    let app: INestApplication;
    let catsRepo: CatsRepository;
    let humansRepo: HumansRepository;
    let dbService: DbTestService;

    beforeAll(async () => {
        app = await createTestingApp();
        await app.init();
        catsRepo = app.get(CatsRepository);
        humansRepo = app.get(HumansRepository);
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
            owner: null,
        });
    });

    it('POST /humans/ success', async () => {
        const response = await request(app.getHttpServer())
            .post('/humans')
            .send({ name: 'Ivan', address: { city: 'Lviv', street: 'Chornovola', home: '59' } })
            .expect(201);

        expect(response.body).toMatchObject({ name: 'Ivan' });
        expect(response.body.address).toMatchObject({ city: 'Lviv', street: 'Chornovola', home: '59' });

        const human = await humansRepo.findById(new Id(response.body.id));

        expect(human.toJSON()).toMatchObject({ name: 'Ivan' });
        expect(human.toJSON().address).toMatchObject({ city: 'Lviv', street: 'Chornovola', home: '59' });
    });

    it('PUT /cats/:id/owner', async () => {
        const cat = new Cat(new Id('1'), 'murzik');
        const human = new Human(new Id('2'), 'Petro');
        await catsRepo.add(cat);
        await humansRepo.add(human);

        await request(app.getHttpServer()).put('/cats/1/owner').send({ human: '2' }).expect(200);

        const result = await catsRepo.findById(cat.id);

        expect(result.toJSON()).toStrictEqual({
            id: '1',
            name: 'murzik',
            owner: {
                id: '2',
                name: 'Petro',
                address: null,
            },
        });
    });
});
