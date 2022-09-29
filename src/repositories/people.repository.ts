import { Injectable } from '@nestjs/common';
import { Person } from '../entities/person';

@Injectable()
export class PeopleRepository {
  people: Person[] = [];

  addPerson(person: Person) {
    this.people.push(person);

    return person;
  }
}
