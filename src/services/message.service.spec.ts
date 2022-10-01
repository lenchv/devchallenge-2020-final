import { BroadcastMessage } from '../dto/broadcast-message.dto';
import { Person } from '../entities/Person';
import { Relation } from '../entities/relation';
import { PeopleRepository } from '../repositories/people.repository';
import { MessageService } from './message.service';
import { NotificationService } from './notification.service';

describe('MessageService', () => {
    let messageService: MessageService;
    let notificationService: NotificationService;
    let peopleRepository: PeopleRepository;

    beforeEach(() => {
        peopleRepository = new PeopleRepository();
        notificationService = new NotificationService();
        messageService = new MessageService(peopleRepository, notificationService);
    });

    describe('broadcastMessage', () => {
        it('should not accept invalid data', async () => {
            const invalidData: Array<[BroadcastMessage, string]> = [
                [{ text: '', from_person_id: '', min_trust_level: 12, topics: [] }, 'Message text cannot be empty'],
                [
                    { text: 'text', from_person_id: '', min_trust_level: 12, topics: null },
                    'Topics must be an array of strings',
                ],
                [{ text: 'text', from_person_id: '', min_trust_level: 12, topics: [] }, 'Topics cannot be empty'],
                [
                    { text: 'text', from_person_id: 'Gary', min_trust_level: 12, topics: ['magic'] },
                    'Level must be greater than 0 and not higher 10',
                ],
                [{ text: 'text', from_person_id: '', min_trust_level: 10, topics: ['magic'] }, 'id cannot be empty'],
                [
                    { text: 'text', from_person_id: 'Gary', min_trust_level: 10, topics: ['magic'] },
                    'Person with id "Gary" not found',
                ],
            ];
            await Promise.all(
                invalidData.map(async ([data, errorMessage]) => {
                    try {
                        await messageService.broadcastMessage(data);
                    } catch (e) {
                        expect(e.message).toBe(errorMessage);
                    }
                }),
            );
        });

        it('should notify neighbors correctly', async () => {
            const gary = new Person('Gary', ['books', 'magic', 'movies']);
            const hermoine = new Person('Hermoine', ['books', 'magic']);
            const ron = new Person('Ron', ['movies', 'magic']);

            gary.addRelation(new Relation('Ron', 10));
            gary.addRelation(new Relation('Hermoine', 10));
            gary.addRelation(new Relation('Snape', 4));

            let criteriaCallsCount = 0;
            jest.spyOn(peopleRepository, 'findById').mockImplementation(async () => gary);
            jest.spyOn(peopleRepository, 'findByCriteria').mockImplementation(async () => {
                if (criteriaCallsCount === 0) {
                    criteriaCallsCount++;
                    return [hermoine, ron];
                } else {
                    return [];
                }
            });

            const result = await messageService.broadcastMessage({
                text: 'hi',
                from_person_id: 'Gary',
                topics: ['magic'],
                min_trust_level: 10,
            });

            expect(result).toStrictEqual({
                Gary: ['Hermoine', 'Ron'],
            });
        });

        it.only('should not notify twice', async () => {
            const gary = new Person('Gary', ['books', 'magic', 'movies']);
            const hermoine = new Person('Hermoine', ['books', 'magic']);
            const ron = new Person('Ron', ['movies', 'magic']);

            gary.addRelation(new Relation('Ron', 10));
            gary.addRelation(new Relation('Hermoine', 10));
            hermoine.addRelation(new Relation('Ron', 10));
            ron.addRelation(new Relation('Gary', 10));

            let criteriaCallsCount = 0;
            jest.spyOn(peopleRepository, 'findById').mockImplementation(async () => gary);
            jest.spyOn(peopleRepository, 'findByCriteria').mockImplementation(async () => {
                if (criteriaCallsCount === 0) {
                    criteriaCallsCount++;
                    return [hermoine, ron];
                } else {
                    return [];
                }
            });

            const result = await messageService.broadcastMessage({
                text: 'hi',
                from_person_id: 'Gary',
                topics: ['magic'],
                min_trust_level: 10,
            });

            expect(result).toStrictEqual({
                Gary: ['Hermoine', 'Ron'],
            });
        });

        it.only('should notify through neighbors', async () => {
            const gary = new Person('Gary', ['books', 'magic', 'movies']);
            const hermoine = new Person('Hermoine', ['books', 'magic']);
            const ron = new Person('Ron', ['movies', 'magic']);
            const jinnie = new Person('Jinnie', ['books', 'magic']);

            gary.addRelation(new Relation('Hermoine', 10));
            gary.addRelation(new Relation('Ron', 10));
            hermoine.addRelation(new Relation('Ron', 10));
            ron.addRelation(new Relation('Gary', 10));
            ron.addRelation(new Relation('Jinnie', 10));

            let criteriaCallsCount = 0;
            jest.spyOn(peopleRepository, 'findById').mockImplementation(async () => gary);
            jest.spyOn(peopleRepository, 'findByCriteria').mockImplementation(async (criterias) => {
                if (criteriaCallsCount === 0) {
                    criteriaCallsCount++;
                    return [hermoine, ron];
                } else if (criteriaCallsCount === 1) {
                    criteriaCallsCount++;
                    return [jinnie];
                } else {
                    return [];
                }
            });

            const result = await messageService.broadcastMessage({
                text: 'hi',
                from_person_id: 'Gary',
                topics: ['magic'],
                min_trust_level: 10,
            });

            expect(result).toStrictEqual({
                Gary: ['Hermoine', 'Ron'],
                Ron: ['Jinnie'],
            });
        });
    });
});
