import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PeopleRepository } from '../src/repositories/people.repository';
import { Person } from '../src/entities/Person';

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let peopleRepository: PeopleRepository;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        peopleRepository = app.get(PeopleRepository);
    });

    it('POST /api/people/ success', () => {
        return request(app.getHttpServer())
            .post('/api/people')
            .send({ id: 'Gary', topics: ['magic', 'books'] })
            .expect(201)
            .expect({ id: 'Gary', topics: ['magic', 'books'] });
    });

    it('POST /api/people/ fail on setting invalid id', () => {
        return request(app.getHttpServer())
            .post('/api/people')
            .send({ id: { test: 12 }, topics: [] })
            .expect(400)
            .expect({ message: 'id should have simple type: string, number' });
    });

    it('POST /api/people/ fail on setting invalid topics', () => {
        return request(app.getHttpServer())
            .post('/api/people')
            .send({ id: 'test', topics: [{ id: 12 }, null] })
            .expect(400)
            .expect({ message: 'topic must be string' });
    });

    it('POST /api/people/<id>/trust_connections success', async () => {
        await peopleRepository.addPerson(new Person('Gary', ['books', 'magic']));

        return request(app.getHttpServer())
            .post('/api/people/Gary/trust_connections')
            .send({ Hermoine: 10 })
            .expect(201);
    });

    it('POST /api/people/<id>/trust_connections invalid values', async () => {
        await peopleRepository.addPerson(new Person('Gary', ['books', 'magic']));

        return request(app.getHttpServer())
            .post('/api/people/Gary/trust_connections')
            .send({ Hermoine: { test: 12 } })
            .expect(400)
            .expect({ message: 'value must be a valid number' });
    });
});
