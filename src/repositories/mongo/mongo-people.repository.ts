import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Relation } from '../../entities/relation';
import { Person } from '../../entities/person';
import { Person as PersonModel, PersonDocument } from '../../models/person.model';
import { Id } from '../../valueObjects/id';
import { Criteria } from '../criteria';
import { PeopleRepository } from '../people.repository';

@Injectable()
export class MongoPeopleRepository implements PeopleRepository {
    people: Person[] = [];

    constructor(@InjectModel(PersonModel.name) private readonly personModel: Model<PersonDocument>) {}

    async findById(id: Id): Promise<Person | undefined> {
        const model = await this.personModel.findOne({ id: String(id) });

        if (!model) {
            return;
        }

        const person = new Person(model.id, model.topics);
        person.setRelations(model.pairs.map((r) => new Relation(r.id, r.trustLevel)));

        return person;
    }

    async addPerson(person: Person): Promise<Person> {
        const createdModel = new this.personModel(person.toJSON());

        await createdModel.save();

        return person;
    }

    async addPeople(people: Person[]): Promise<void> {
        await this.personModel.collection.insertMany(people.map((person) => new this.personModel(person.toJSON())));
    }

    async addRelations(person: Person, relations: Relation[]): Promise<Person> {
        await this.personModel.findOneAndUpdate({ id: String(person.id) }, { pairs: relations.map((r) => r.toJSON()) });

        person.setRelations(relations);

        return person;
    }

    async findByCriteria(criterions: Criteria<FilterQuery<PersonDocument>>[]): Promise<Person[]> {
        const filterQuery = criterions.reduce((filterQuery, criteria) => {
            return criteria.query(filterQuery);
        }, {});

        const models = await this.personModel.find(filterQuery);

        return models.map((model) => {
            const person = new Person(model.id, model.topics);
            person.setRelations(model.pairs.map((r) => new Relation(r.id, r.trustLevel)));

            return person;
        });
    }

    async wipe() {
        await this.personModel.collection.deleteMany({});
    }
}
