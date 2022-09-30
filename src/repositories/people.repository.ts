import { Injectable } from '@nestjs/common';
import { Relation } from '../entities/relation';
import { Person } from '../entities/person';

@Injectable()
export class PeopleRepository {
    people: Person[] = [];

    findById(id: string): Person | undefined {
        return this.people.find((person) => person.id === id);
    }

    addPerson(person: Person) {
        this.people.push(person);

        return person;
    }

    addRelations(person: Person, relations: Relation[]) {
        relations.forEach((relation) => {
            person.addRelation(relation);
        });

        return person;
    }
}
