import { Person } from '../entities/person';

export class CreatePersonDto {
    id: string;
    topics: string[];

    static fromPerson(person: Person) {
        const dto = new CreatePersonDto();
        const data = person.toJSON();

        dto.id = data.id;
        dto.topics = data.topics;

        return dto;
    }
}
