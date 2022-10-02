import { Person } from '../../src/entities/Person';
import { v4 as uuid } from 'uuid';
import { Relation } from '../../src/entities/relation';

export const generateNetwork = (depth: number, width: number, topics: string[]): Person[] => {
    let i = 0;
    const personIds = [];
    while (i++ < depth * width) {
        personIds.push(uuid());
    }

    const persons = personIds.map((id) => new Person(id, topics));

    for (let i = 0; i < persons.length - width - 1; i += width) {
        const relations = [];
        for (let j = 0; j < width; j++) {
            relations.push(new Relation(persons[i + j + 1].id, Math.ceil(((j + 1) / width) * 10)));
        }
        persons[i].setRelations(relations);
    }

    return persons;
};
