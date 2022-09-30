import { Person } from '../entities/Person';
import { PeopleRepository } from '../repositories/people.repository';
import { PeopleService } from './people.service';

describe('PeopleService', () => {
    let peopleService: PeopleService;
    let peopleRepository: PeopleRepository;

    beforeEach(() => {
        peopleRepository = new PeopleRepository();

        peopleService = new PeopleService(peopleRepository);

        jest.spyOn(peopleRepository, 'addPerson').mockImplementation((person) => person);
        jest.spyOn(peopleRepository, 'addRelations').mockImplementation((p, relations) => {
            relations.forEach((r) => p.addRelation(r));
            return p;
        });
    });

    describe('addPerson', () => {
        it('should add person', async () => {
            const person = { id: 'test', topics: ['1', '2'] };
            const result = await peopleService.addPerson(person);

            expect(result.id).toBe(person.id);
            expect(result.topics).toStrictEqual(person.topics);
        });

        it('should not add person with empty id', async () => {
            try {
                await peopleService.addPerson({ id: '', topics: ['1', '2'] });
            } catch (e) {
                expect(e.message).toBe('id cannot be empty');
            }
        });

        it('should not add person with empty topics', async () => {
            try {
                await peopleService.addPerson({ id: 'test', topics: [] });
            } catch (e) {
                expect(e.message).toBe('topics cannot be empty');
            }
        });
    });

    describe('addTrustConnections', () => {
        it('should add relations', async () => {
            const p = new Person('Gary', ['books', 'magic']);
            jest.spyOn(peopleRepository, 'findById').mockImplementation(() => p);

            await peopleService.addTrustConnections('Gary', {
                Voldemort: 1,
                Snape: 4,
            });

            expect(p.pairs.map((p) => p.toJSON())).toStrictEqual([
                { id: 'Voldemort', trustLevel: 1 },
                { id: 'Snape', trustLevel: 4 },
            ]);
        });

        it('should throw error if user not found', async () => {
            try {
                await peopleService.addTrustConnections('Hermoine', {
                    Voldemort: 1,
                });
            } catch (e) {
                expect(e.message).toBe('Person with id "Hermoine" not found');
            }
        });

        it('should throw error if relations are empty', async () => {
            try {
                await peopleService.addTrustConnections('Hermoine', {});
            } catch (e) {
                expect(e.message).toBe('List of relations cannot be empty');
            }
        });

        it('should throw error if relations are invalid', async () => {
            const p = new Person('Gary', ['books', 'magic']);
            jest.spyOn(peopleRepository, 'findById').mockImplementation(() => p);
            await Promise.all(
                [-1, 10].map(async (level) => {
                    try {
                        await peopleService.addTrustConnections('Gary', {
                            Hermoine: level,
                        });
                    } catch (e) {
                        expect(e.message).toBe('Level must be greater than 0 and not higher 10');
                    }
                }),
            );
        });
    });
});
