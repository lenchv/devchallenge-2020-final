import { writeFile } from 'fs/promises';
import { join } from 'path';
import { Person } from '../../src/entities/person';

export const saveToCsvForNeo4j = async (people: Person[]): Promise<void> => {
    const peopleLines = people.map((person) => {
        return `${person.id},${person.topics.join(';')}`;
    });
    const relationshipLines = people.flatMap((person) => {
        return person.pairs.map((relation) => {
            return `${person.id},${Number(relation.trustLevel)},${relation.id}`;
        });
    });
    await writeFile(
        join(__dirname, '..', '..', '.neo4j_scripts', 'people.csv'),
        'id:ID(Person),topics:string[]\n' + peopleLines.join('\n'),
    );

    await writeFile(
        join(__dirname, '..', '..', '.neo4j_scripts', 'relations.csv'),
        ':START_ID(Person),level:int,:END_ID(Person)\n' + relationshipLines.join('\n'),
    );
};
