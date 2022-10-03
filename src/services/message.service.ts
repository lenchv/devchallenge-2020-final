import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PeopleRepository } from '../repositories/people.repository';
import { Topic } from '../valueObjects/topic';
import { BroadcastMessage } from '../dto/broadcast-message.dto';
import { MessageResponse } from '../dto/message-response.dto';
import { Level } from '../valueObjects/level';
import { Id } from '../valueObjects/id';
import { Person } from '../entities/person';
import { NotificationService } from './notification.service';
import { LogicException } from '../exceptions/logic.exception';
import { Queue } from '@datastructures-js/queue';
import { ShortPathResponse } from '../dto/short-path-response.dto';

@Injectable()
export class MessageService {
    constructor(
        @Inject('PeopleRepository') private readonly peopleRepository: PeopleRepository,
        private readonly notificationService: NotificationService,
    ) {}

    async broadcastMessage(message: BroadcastMessage): Promise<MessageResponse> {
        const { text, topics, personId, minTrustLevel } = this.getMessageData(message);
        const person = await this.peopleRepository.findById(personId);

        if (!person) {
            throw new LogicException(`Person with id "${personId}" not found`, HttpStatus.NOT_FOUND);
        }

        const people = await this.peopleRepository.queryGraphForBroadcast(topics, minTrustLevel);
        const peopleMap: Map<string, Person> = people.reduce((result, person) => {
            result.set(String(person.id), person);
            return result;
        }, new Map());

        const visited = new Map();
        visited.set(String(person.id), true);

        const response = await this.traversePeopleGraphInDepth(
            person,
            peopleMap,
            minTrustLevel,
            visited,
            async (recipient: Person): Promise<void> => {
                if (!recipient.id.equalsTo(person.id)) {
                    this.notificationService.send(person, recipient, text);
                }
            },
        );

        return response;
    }

    async findShortestPath(message: BroadcastMessage): Promise<ShortPathResponse> {
        const { topics, personId, minTrustLevel } = this.getMessageData(message);

        if (topics.length === 0) {
            throw new LogicException('topics cannot be empty');
        }

        const personIterator = await this.peopleRepository.getShortestPathIterator(personId, topics, minTrustLevel);
        const visited = new Map();
        visited.set(String(personId), true);

        const path = await this.traversePeopleGraphInBreadth(personId, personIterator, topics, minTrustLevel, visited);

        return {
            from: String(personId),
            path: path.map(String),
        };
    }

    private getMessageData(message: BroadcastMessage): {
        text: string;
        topics: Topic[];
        personId: Id;
        minTrustLevel: Level;
    } {
        if (!message.text) {
            throw new LogicException('Message text cannot be empty');
        }

        if (typeof message.text !== 'string') {
            throw new LogicException('Message text must be string');
        }

        if (!Array.isArray(message.topics)) {
            throw new LogicException('Topics must be an array of strings');
        }

        const text: string = message.text;
        const topics: Topic[] = message.topics.map((topic) => new Topic(topic));
        const personId = new Id(message.from_person_id);
        const minTrustLevel = new Level(message.min_trust_level);

        return { text, topics, personId, minTrustLevel };
    }

    private async traversePeopleGraphInDepth(
        person: Person,
        people: Map<string, Person>,
        minTrustLevel: Level,
        visited: Map<string, boolean>,
        visit: (person: Person) => Promise<void>,
    ): Promise<MessageResponse> {
        const isVisited = (id: Id, visited: Map<string, boolean>) => visited.has(String(id));
        const isLevelAccepted = (level, minTrustLevel: Level) => Number(level) >= Number(minTrustLevel);

        const persons = [person];
        const result: MessageResponse = {};

        while (persons.length) {
            const current = persons.pop();
            await visit(current);
            const relations = current.pairs.filter(
                (relation) => isLevelAccepted(relation.trustLevel, minTrustLevel) && !isVisited(relation.id, visited),
            );
            const siblingsId = relations.map((r) => {
                visited.set(String(r.id), true);
                return r.id;
            });

            if (siblingsId.length === 0) {
                continue;
            }

            const siblings = siblingsId.map((id) => people.get(String(id))).filter(Boolean);

            for (let i = siblings.length - 1; i >= 0; i--) {
                persons.push(siblings[i]);
            }

            if (siblings.length) {
                result[String(current.id)] = siblings.map((person) => String(person.id));
            }
        }

        return result;
    }

    private async traversePeopleGraphInBreadth(
        root: Id,
        personIterator: (ids: Id[]) => Promise<Person[]>,
        topics: Topic[],
        minTrustLevel: Level,
        visited: Map<string, boolean>,
    ): Promise<Id[]> {
        const isVisited = (id: Id, visited: Map<string, boolean>) => visited.has(String(id));
        const isLevelAccepted = (level: Level, minTrustLevel: Level) => Number(level) >= Number(minTrustLevel);
        const areTopicsAccepted = (person: Person, topics: Topic[]) =>
            topics.every((topic) => person.topics.some((t) => t.equalsTo(topic)));
        const getPath = (resultMap: Map<string, Id>, root: Id, id?: Id): Id[] =>
            id.equalsTo(root) ? [] : [...getPath(resultMap, root, resultMap.get(String(id))), id];

        const person = await personIterator([root]);

        if (person.length === 0) {
            throw new LogicException(`Person with id "${root}" not found`, HttpStatus.NOT_FOUND);
        }

        const persons = new Queue<Person>();
        persons.enqueue(person[0]);
        const result: Map<string, Id> = new Map();

        while (persons.size()) {
            const current = persons.dequeue();

            const relations = current.pairs.filter(
                (relation) => isLevelAccepted(relation.trustLevel, minTrustLevel) && !isVisited(relation.id, visited),
            );
            const siblingsId = relations.map((r) => {
                visited.set(String(r.id), true);
                return r.id;
            });

            if (siblingsId.length === 0) {
                continue;
            }

            const siblings = await personIterator(siblingsId);

            for (let i = 0; i < siblings.length; i++) {
                const sibling = siblings[i];

                result.set(String(sibling.id), current.id);

                if (areTopicsAccepted(sibling, topics)) {
                    return getPath(result, root, sibling.id);
                }

                persons.enqueue(sibling);
            }
        }

        return [];
    }
}
