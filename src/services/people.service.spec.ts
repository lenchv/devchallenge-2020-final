import { Person } from '../entities/person';
import { PeopleRepository } from '../repositories/people.repository';
import { PeopleService } from './people.service';

describe('PeopleService', () => {
    let peopleService: PeopleService;
    let peopleRepository: PeopleRepository;

    beforeEach(() => {
        peopleRepository = <PeopleRepository>{
            findById: jest.fn(),
            findByCriteria: jest.fn(),
            addRelations: jest.fn(),
            addPerson: jest.fn(),
            updatePerson: jest.fn(),
            addPeople: jest.fn(),
            queryGraphForBroadcast: jest.fn(),
            getShortestPathIterator: jest.fn(),
            wipe: jest.fn(),
        };
        peopleService = new PeopleService(peopleRepository);

        jest.spyOn(peopleRepository, 'addPerson').mockImplementation(async (person) => person);
        jest.spyOn(peopleRepository, 'addRelations').mockImplementation((p, relations) => {
            p.setRelations(relations);
            return Promise.resolve(p);
        });
    });

    describe('addPerson', () => {
        it('should add person', async () => {
            const person = { id: 'test', topics: ['1', '2'] };
            const result = await peopleService.addPerson(person);

            expect(String(result.id)).toBe(person.id);
            expect(result.topics.map((t) => String(t))).toStrictEqual(person.topics);
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
            jest.spyOn(peopleRepository, 'findById').mockImplementation(async (): Promise<Person> => p);

            await peopleService.addTrustConnections('Gary', {
                Voldemort: 1,
                Snape: 4,
            });

            expect(p.pairs.map((p) => p.toJSON())).toStrictEqual([
                { id: 'Voldemort', trustLevel: 1 },
                { id: 'Snape', trustLevel: 4 },
            ]);
        });

        it('should update relations', async () => {
            const p = new Person('Gary', ['books', 'magic']);
            jest.spyOn(peopleRepository, 'findById').mockImplementation(async (): Promise<Person> => p);

            await peopleService.addTrustConnections('Gary', {
                Voldemort: 1,
                Snape: 4,
            });

            await peopleService.addTrustConnections('Gary', {
                Snape: 6,
                Voldemort: 1,
                Ron: 10,
            });

            expect(p.pairs.map((p) => p.toJSON())).toStrictEqual([
                { id: 'Snape', trustLevel: 6 },
                { id: 'Voldemort', trustLevel: 1 },
                { id: 'Ron', trustLevel: 10 },
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
            jest.spyOn(peopleRepository, 'findById').mockImplementation(async (): Promise<Person> => p);
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
