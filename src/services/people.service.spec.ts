import { PeopleRepository } from '../repositories/people.repository';
import { PeopleService } from './people.service';

describe('PeopleService', () => {
  let peopleService: PeopleService;
  let peopleRepository: PeopleRepository;

  beforeEach(() => {
    peopleRepository = new PeopleRepository();
    jest.spyOn(peopleRepository, 'addPerson').mockImplementation((person) => person);

    peopleService = new PeopleService(peopleRepository);
  });

  it('should add person', async () => {

    const person = { id: 'test', topics: ['1', '2'] };
    const result = await peopleService.addPerson(person);

    expect(result.id).toBe(person.id);
    expect(result.topics).toBe(person.topics);
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
