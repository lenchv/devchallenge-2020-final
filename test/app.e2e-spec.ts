import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PeopleRepository } from '../src/repositories/people.repository';
import { Person } from '../src/entities/person';
import { Id } from '../src/valueObjects/id';
import { Relation } from '../src/entities/relation';
import { generateNetwork } from './helpers/generateNetwork';
import { saveToCsvForNeo4j } from './helpers/saveToCsvForNeo4j';

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let peopleRepository: PeopleRepository;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        peopleRepository = app.get('PeopleRepository');
        await peopleRepository.wipe();
    });

    afterEach(async () => {
        await app.close();
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
            .expect(422)
            .expect({ message: 'id should have simple type: string, number' });
    });

    it('POST /api/people/ fail on setting invalid topics', () => {
        return request(app.getHttpServer())
            .post('/api/people')
            .send({ id: 'test', topics: [{ id: 12 }, null] })
            .expect(422)
            .expect({ message: 'topic must be string' });
    });

    it('POST /api/people/ id must be case-sensitive', async () => {
        await request(app.getHttpServer())
            .post('/api/people')
            .send({ id: 'Gary', topics: ['books'] })
            .expect(201);
        await request(app.getHttpServer())
            .post('/api/people')
            .send({ id: 'gAry', topics: ['books'] })
            .expect(201);

        const gary1 = await peopleRepository.findById(new Id('Gary'));
        const gary2 = await peopleRepository.findById(new Id('gAry'));
        expect(gary1.toJSON()).toStrictEqual({ id: 'Gary', topics: ['books'], pairs: [] });
        expect(gary2.toJSON()).toStrictEqual({ id: 'gAry', topics: ['books'], pairs: [] });
    });

    it('POST /api/people/ should fail if user already exists', async () => {
        await request(app.getHttpServer())
            .post('/api/people')
            .send({ id: 'Gary', topics: ['books'] })
            .expect(201);
        await request(app.getHttpServer())
            .post('/api/people')
            .send({ id: 'Gary', topics: ['books'] })
            .expect(422)
            .expect({ message: 'User "Gary" already exists' });
    });

    it('POST /api/people/<id>/trust_connections success adding', async () => {
        await peopleRepository.addPerson(new Person('Gary', ['books', 'magic']));

        return request(app.getHttpServer())
            .post('/api/people/Gary/trust_connections')
            .send({ Hermoine: 10 })
            .expect(201);
    });

    it('POST /api/people/<id>/trust_connections success update', async () => {
        await peopleRepository.addPeople([
            new Person('Gary', ['books', 'magic']),
            new Person('Hermoine', ['books', 'magic']),
            new Person('Ron', ['books', 'magic']),
            new Person('Snape', ['books', 'magic']),
        ]);

        await request(app.getHttpServer())
            .post('/api/people/Gary/trust_connections')
            .send({ Hermoine: 10, Snape: 4 })
            .expect(201);
        await request(app.getHttpServer())
            .post('/api/people/Gary/trust_connections')
            .send({ Ron: 10, Hermoine: 9 })
            .expect(201);

        const gary = await peopleRepository.findById(new Id('Gary'));

        expect(gary.pairs.map((r) => r.toJSON())).toStrictEqual([
            { id: 'Ron', trustLevel: 10 },
            { id: 'Hermoine', trustLevel: 9 },
        ]);
    });

    it('POST /api/people/<id>/trust_connections invalid values', async () => {
        await peopleRepository.addPerson(new Person('Gary', ['books', 'magic']));

        return request(app.getHttpServer())
            .post('/api/people/Gary/trust_connections')
            .send({ Hermoine: { test: 12 } })
            .expect(422)
            .expect({ message: 'value must be a valid number' });
    });

    describe('POST /api/messages', () => {
        beforeEach(async () => {
            const gary = new Person('Gary', ['books', 'magic', 'movies']);
            const hermoine = new Person('Hermoine', ['books', 'magic']);
            const ron = new Person('Ron', ['magic', 'movies']);
            const snape = new Person('Snape', ['poisons', 'magic', 'books', 'evil']);
            const voldemort = new Person('Voldemort', ['evil', 'magic']);
            const malfoy = new Person('Malfoy', ['magic', 'books', 'evil']);
            const jinnie = new Person('Jinnie', ['movies', 'magic', 'books']);
            const greg = new Person('Greg', ['movies', 'magic']);
            const beatrice = new Person('Beatrice', ['books', 'magic']);
            const relations: [Person, ...[string, number][]][] = [
                [gary, ['Hermoine', 10], ['Ron', 10], ['Snape', 4], ['Voldemort', 1]],
                [hermoine, ['Gary', 10], ['Ron', 10], ['Greg', 6]],
                [ron, ['Gary', 10], ['Hermoine', 10], ['Jinnie', 9]],
                [greg, ['Malfoy', 8]],
                [malfoy, ['Snape', 9]],
                [snape, ['Beatrice', 8], ['Voldemort', 6]],
                [jinnie, ['Greg', 5], ['Ron', 8]],
            ];
            relations.forEach(([person, ...relationData]) => {
                person.setRelations(relationData.map(([id, trust]) => new Relation(id, trust)));
            });
            await peopleRepository.addPeople([gary, hermoine, ron, snape, voldemort, malfoy, jinnie, greg, beatrice]);
        });
        it('broadcast to all', async () => {
            await request(app.getHttpServer())
                .post('/api/messages')
                .send({ text: 'Voldemort is alive', topics: ['magic'], from_person_id: 'Gary', min_trust_level: 6 })
                .expect(201)
                .expect({
                    Gary: ['Hermoine', 'Ron'],
                    Ron: ['Jinnie'],
                    Hermoine: ['Greg'],
                    Greg: ['Malfoy'],
                    Malfoy: ['Snape'],
                    Snape: ['Beatrice', 'Voldemort'],
                });
        });

        it('broadcast to nearest', async () => {
            await request(app.getHttpServer())
                .post('/api/messages')
                .send({
                    text: 'Secret room is opened',
                    topics: ['magic', 'books'],
                    from_person_id: 'Ron',
                    min_trust_level: 8,
                })
                .expect(201)
                .expect({
                    Ron: ['Gary', 'Hermoine', 'Jinnie'],
                });
        });

        it('broadcast through one', async () => {
            await request(app.getHttpServer())
                .post('/api/messages')
                .send({
                    text: "Let's watch a movie",
                    topics: ['magic', 'movies'],
                    from_person_id: 'Jinnie',
                    min_trust_level: 8,
                })
                .expect(201)
                .expect({
                    Jinnie: ['Ron'],
                    Ron: ['Gary'],
                });

            await request(app.getHttpServer())
                .post('/api/messages')
                .send({
                    text: "Let's watch a movie",
                    topics: ['magic', 'movies'],
                    from_person_id: 'Jinnie',
                    min_trust_level: 5,
                })
                .expect(201)
                .expect({
                    Jinnie: ['Greg', 'Ron'],
                    Ron: ['Gary'],
                });
        });

        it('no one receives', async () => {
            await request(app.getHttpServer())
                .post('/api/messages')
                .send({
                    text: 'Did anyone see my socks?',
                    topics: ['socks', 'magic'],
                    from_person_id: 'Ron',
                    min_trust_level: 1,
                })
                .expect(201)
                .expect({});
        });

        it('gossip through the network', async () => {
            await request(app.getHttpServer())
                .post('/api/messages')
                .send({
                    text: 'Gary wants to kill Voldemort!!!',
                    topics: ['evil', 'magic'],
                    from_person_id: 'Greg',
                    min_trust_level: 6,
                })
                .expect(201)
                .expect({
                    Greg: ['Malfoy'],
                    Malfoy: ['Snape'],
                    Snape: ['Voldemort'],
                });
        });
    });

    describe('POST /api/path', () => {
        beforeEach(async () => {
            const gary = new Person('Gary', ['books', 'magic', 'movies']);
            const hermoine = new Person('Hermoine', ['books', 'magic']);
            const ron = new Person('Ron', ['magic', 'movies']);
            const snape = new Person('Snape', ['poisons', 'magic', 'books', 'evil']);
            const voldemort = new Person('Voldemort', ['evil', 'magic']);
            const malfoy = new Person('Malfoy', ['magic', 'books', 'evil']);
            const jinnie = new Person('Jinnie', ['movies', 'magic', 'books']);
            const greg = new Person('Greg', ['movies', 'magic']);
            const beatrice = new Person('Beatrice', ['books', 'magic']);
            const relations: [Person, ...[string, number][]][] = [
                [gary, ['Hermoine', 10], ['Ron', 10], ['Snape', 4], ['Voldemort', 1]],
                [hermoine, ['Gary', 10], ['Ron', 10], ['Greg', 6], ['Snape', 5]],
                [ron, ['Gary', 10], ['Hermoine', 10], ['Jinnie', 9]],
                [greg, ['Malfoy', 8]],
                [malfoy, ['Snape', 9]],
                [snape, ['Beatrice', 8], ['Voldemort', 6]],
                [jinnie, ['Greg', 5], ['Ron', 8]],
            ];
            relations.forEach(([person, ...relationData]) => {
                person.setRelations(relationData.map(([id, trust]) => new Relation(id, trust)));
            });

            await peopleRepository.addPeople([gary, hermoine, ron, snape, voldemort, malfoy, jinnie, greg, beatrice]);
        });
        it('find who can brew poison among evil ones', async () => {
            await request(app.getHttpServer())
                .post('/api/path')
                .send({
                    text: 'Need a poison, ASAP!',
                    topics: ['evil', 'poisons'],
                    from_person_id: 'Gary',
                    min_trust_level: 6,
                })
                .expect(201)
                .expect({
                    from: 'Gary',
                    path: ['Hermoine', 'Greg', 'Malfoy', 'Snape'],
                });
        });

        it('find shorter path who can brew poison among evil ones', async () => {
            await request(app.getHttpServer())
                .post('/api/path')
                .send({
                    text: 'Need a poison, ASAP!',
                    topics: ['evil', 'poisons'],
                    from_person_id: 'Gary',
                    min_trust_level: 5,
                })
                .expect(201)
                .expect({
                    from: 'Gary',
                    path: ['Hermoine', 'Snape'],
                });
        });

        it('find the shortest path who can brew poison among evil ones', async () => {
            await request(app.getHttpServer())
                .post('/api/path')
                .send({
                    text: 'Need a poison, ASAP!',
                    topics: ['evil', 'poisons'],
                    from_person_id: 'Gary',
                    min_trust_level: 4,
                })
                .expect(201)
                .expect({
                    from: 'Gary',
                    path: ['Snape'],
                });
        });
    });

    describe('test performance', () => {
        jest.setTimeout(600000);
        it('perfomrance', async () => {
            const persons = generateNetwork(100, 1, ['test']);
            //await saveToCsvForNeo4j(persons);
            await peopleRepository.addPeople(persons);
            await request(app.getHttpServer())
                .post('/api/messages')
                .send({
                    text: 'test message',
                    topics: ['test'],
                    from_person_id: String(persons[0].id),
                    min_trust_level: 1,
                })
                .expect(201);
        });
    });
});
