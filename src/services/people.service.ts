import { Injectable } from '@nestjs/common';
import { CreatePersonDto } from '../dto/create-person.dto';
import { Person } from '../entities/Person';
import { PeopleRepository } from '../repositories/people.repository';

@Injectable()
export class PeopleService {
  constructor(private readonly peopleRepository: PeopleRepository) {}

  async addPerson(personData: CreatePersonDto): Promise<Person> {
    const person = new Person(personData.id, personData.topics);

    return await this.peopleRepository.addPerson(person);
  }
}
