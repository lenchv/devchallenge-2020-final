import { writeFile } from 'fs/promises';
import { join } from 'path';
import { Person } from '../../src/entities/person';
import { generateNetwork } from './generateNetwork';

export const generateForShell = async (people: Person[]): Promise<void> => {
    const addPerson = (data) =>
        // eslint-disable-next-line max-len
        `curl -s -XPOST http://localhost:8080/api/people -H "Content-Type: application/json" -d '${JSON.stringify(data)}'`;
    const addRelation = (person, data) =>
        // eslint-disable-next-line max-len
        `curl -s -XPOST http://localhost:8080/api/people/${person}/trust_connections -H "Content-Type: application/json" -d '${JSON.stringify(
            data,
        )}'`;

    const peopleLines = people.map((person) => {
        return addPerson({ id: String(person.id), topics: person.topics.map(String) });
    });
    const relationshipLines = people.map((person) => {
        const data = person.pairs.reduce((result, relation) => {
            result[String(relation.id)] = Number(relation.trustLevel);
            return result;
        }, {});

        return addRelation(String(person.id), data);
    });
    await writeFile(
        join(__dirname, '..', '..', 'seed-db.sh'),
        peopleLines.join('\n') + '\n' + relationshipLines.join('\n'),
    );
};

(async () => {
    const people = generateNetwork(300000, 1, ['test']);
    await generateForShell(people);
})();
