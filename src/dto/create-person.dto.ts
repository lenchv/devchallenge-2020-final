import { Person } from '../entities/Person';

export class CreatePersonDto {
    id: string;
    topics: string[];

    static fromPerson(person: Person) {
        const dto = new CreatePersonDto();

        dto.id = person.id;
        dto.topics = person.topics;

        return dto;
    }
}
