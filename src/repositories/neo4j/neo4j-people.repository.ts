import { Injectable } from '@nestjs/common';
import { Relation } from '../../entities/relation';
import { Person } from '../../entities/person';
import { Id } from '../../valueObjects/id';
import { Criteria } from '../criteria';
import { PeopleRepository } from '../people.repository';
import { Neo4jService } from 'nest-neo4j';
import { Topic } from '../../valueObjects/topic';
import { Level } from '../../valueObjects/level';
import { TopicsCriteria } from './criterions/topics.criteria';
import { TrustLevelCriteria } from './criterions/trust-level.criteria';

@Injectable()
export class Neo4jPeopleRepository implements PeopleRepository {
    constructor(private readonly neo4jService: Neo4jService) {}

    async findById(id: Id): Promise<Person | undefined> {
        const labelResponse = await this.neo4jService.read(`MATCH (a:Person { id: "${id}" }) RETURN a`);

        if (!labelResponse.records.length) {
            return;
        }

        const label: { id: string; topics: string[] } = labelResponse.records[0].get('a').properties;
        const person = new Person(label?.id, label.topics);

        const relationsResponse = await this.neo4jService.read(
            `MATCH (a:Person { id: "${id}" })-[r:TRUSTS]->(b) RETURN { id: b.id, trustLevel: r.level }`,
        );

        person.setRelations(
            relationsResponse.records.map((r) => {
                const data = Object.values(r.toObject())[0];

                return new Relation(data.id, data.trustLevel.toInt());
            }),
        );

        return person;
    }

    async addPerson(person: Person): Promise<Person> {
        await this.neo4jService.write(
            `CREATE (p:Person { id: "${person.id}", topics: ["${person.topics.join('", "')}"] })`,
        );

        return person;
    }

    async addPeople(people: Person[]): Promise<void> {
        await people.reduce(async (prev, person): Promise<void> => {
            await prev;
            await this.addPerson(person);
        }, Promise.resolve());
        await people.reduce(async (prev, person): Promise<void> => {
            await prev;
            await this.addRelations(person, person.pairs);
        }, Promise.resolve());
    }

    async addRelations(person: Person, relations: Relation[]): Promise<Person> {
        const queries = relations.map((relation) => {
            const match = `MATCH (a:Person { id: "${person.id}" }), (b:Person { id: "${relation.id}" })`;
            return `${match} CREATE (a)-[:TRUSTS { level: ${Number(relation.trustLevel)} }]->(b)`;
        });

        await this.neo4jService.write(`MATCH (a:Person { id: "${person.id}" }), (a)-[r:TRUSTS]->(b) DELETE r`);
        await queries.reduce(async (prev, query): Promise<void> => {
            await prev;
            await this.neo4jService.write(query);
        }, Promise.resolve());

        person.setRelations(relations);

        return person;
    }

    async findByCriteria(criterions: Criteria<string>[]): Promise<Person[]> {
        const filter = criterions.map((criteria) => criteria.query('')).join(' AND ');
        const query = `
            MATCH (n:Person)-[r:TRUSTS]->(m)
            WHERE ${filter}
            RETURN n,m,r
        `;
        const response = await this.neo4jService.read(query);
        type Result = {
            people: Map<string, Person>;
            relations: Map<string, Relation[]>;
        };

        const result = response.records.reduce(
            ({ people, relations }: Result, record): Result => {
                const start = record.get('n').properties;
                const end = record.get('m').properties;
                const trustLevel = new Level(record.get('r').properties.level.toInt());

                if (!people.has(end.id)) {
                    people.set(end.id, new Person(end.id, end.topics));
                }

                if (!relations.has(start.id)) {
                    relations.set(start.id, []);
                }

                relations.get(start.id).unshift(new Relation(end.id, trustLevel));

                return {
                    people,
                    relations,
                };
            },
            {
                people: new Map<string, Person>(),
                relations: new Map<string, Relation[]>(),
            },
        );

        return Array.from(result.people.values()).map((person) => {
            if (result.relations.has(String(person.id))) {
                person.setRelations(result.relations.get(String(person.id)));
            }

            return person;
        });
    }

    async queryGraphForBroadcast(topics: Topic[], minTrustLevel: Level): Promise<Person[]> {
        return await this.findByCriteria([new TopicsCriteria(topics), new TrustLevelCriteria(minTrustLevel)]);
    }

    async queryGraphForShortestPath(personId: Id, topics: Topic[], minTrustLevel: Level): Promise<Person[]> {
        const response = await this.neo4jService.read(
            `MATCH (root:Person {id: "${personId}"}), (destination:Person),
                path = shortestPath((root)-[:TRUSTS*]-(destination))
            WHERE all(r IN relationships(path) WHERE r.level >= ${Number(minTrustLevel)})
                AND all(topic IN ["${topics.join('", "')}"] WHERE topic IN destination.topics)
            RETURN path`,
        );

        if (response.records.length === 0) {
            return [];
        }

        const shortestPath = response.records[0].get('path').segments;
        const result = shortestPath.reduce(
            (parent: Person[], segment): Person[] => {
                const last = parent[parent.length - 1];
                const child = new Person(segment.end.properties.id, segment.end.properties.topics);
                const relation = new Relation(child.id, segment.relationship.properties.level.toInt());

                last.setRelations([relation]);
                parent.push(child);

                return parent;
            },
            [new Person(shortestPath[0].start.properties.id, shortestPath[0].start.properties.topics)],
        );

        return result;
    }

    async getShortestPathIterator(
        personId: Id,
        topics: Topic[],
        minTrustLevel: Level,
    ): Promise<(id: []) => Promise<Person[]>> {
        const response = await this.neo4jService.read(
            `MATCH (root:Person {id: "${personId}"}), (destination:Person),
                path = shortestPath((root)-[:TRUSTS*]-(destination))
            WHERE all(r IN relationships(path) WHERE r.level >= ${Number(minTrustLevel)})
                AND all(topic IN ["${topics.join('", "')}"] WHERE topic IN destination.topics)
            RETURN path`,
        );

        if (response.records.length === 0) {
            return () => Promise.resolve([]);
        }

        const shortestPath = response.records[0].get('path').segments;
        const peopleMap = new Map();
        const rootNode = shortestPath[0].start.properties;
        peopleMap.set(rootNode.id, new Person(rootNode.id, rootNode.topics));

        const result = shortestPath.reduce((parent: Map<string, Person>, segment): Map<string, Person> => {
            const last = parent.get(segment.start.properties.id);
            const child = new Person(segment.end.properties.id, segment.end.properties.topics);
            const relation = new Relation(child.id, segment.relationship.properties.level.toInt());

            last.setRelations([relation]);
            parent.set(String(child.id), child);

            return parent;
        }, peopleMap);

        return async (ids: Id[]): Promise<Person[]> => {
            return ids.map((id) => result.get(String(id)));
        };
    }

    async wipe() {
        await this.neo4jService.write(`MATCH (a:Person)-[r]-() DELETE r;`);
        await this.neo4jService.write(` MATCH (a:Person) DELETE a;`);
    }
}
