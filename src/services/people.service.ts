import { HttpStatus, Injectable } from '@nestjs/common';
import { TrustConnectionPairDto } from '../dto/trust-connection-pair.dto';
import { Relation } from '../entities/relation';
import { LogicException } from '../exceptions/logic.exception';
import { CreatePersonDto } from '../dto/create-person.dto';
import { Person } from '../entities/Person';
import { PeopleRepository } from '../repositories/people.repository';
import { Id } from '../valueObjects/id';

@Injectable()
export class PeopleService {
    constructor(private readonly peopleRepository: PeopleRepository) {}

    async addPerson(personData: CreatePersonDto): Promise<Person> {
        const person = new Person(personData.id, personData.topics);
        const existedPerson = await this.peopleRepository.findById(person.id);

        if (existedPerson) {
            throw new LogicException(`User "${personData.id}" already exists`);
        }

        return await this.peopleRepository.addPerson(person);
    }

    async addTrustConnections(personId: string, pairs: TrustConnectionPairDto): Promise<void> {
        if (!Object.keys(pairs).length) {
            throw new LogicException(`List of relations cannot be empty`);
        }

        const person = await this.peopleRepository.findById(new Id(personId));

        if (!person) {
            throw new LogicException(`Person with id "${personId}" not found`, HttpStatus.NOT_FOUND);
        }

        const relations = Object.entries(pairs).map(([personId, trustLevel]) => new Relation(personId, trustLevel));

        this.peopleRepository.addRelations(person, relations);
    }
}
