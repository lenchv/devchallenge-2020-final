import { Injectable } from '@nestjs/common';
import { Relation } from '../entities/relation';
import { Person } from '../entities/person';
import { Id } from '../valueObjects/id';
import { Criteria } from './criterions/criteria';

@Injectable()
export class PeopleRepository {
    people: Person[] = [];

    async findById(id: Id): Promise<Person | undefined> {
        return this.people.find((person) => person.id.equalsTo(id));
    }

    async addPerson(person: Person): Promise<Person> {
        this.people.push(person);

        return person;
    }

    async addRelations(person: Person, relations: Relation[]): Promise<Person> {
        person.setRelations(relations);

        return person;
    }

    async findByCriteria(criterions: Criteria<Person>[]): Promise<Person[]> {
        return criterions.reduce((people, criteria) => {
            return criteria.query(people);
        }, this.people);
    }
}
