import { HttpStatus, Injectable } from '@nestjs/common';
import { PeopleRepository } from '../repositories/people.repository';
import { Topic } from '../valueObjects/topic';
import { BroadcastMessage } from '../dto/broadcast-message.dto';
import { MessageResponse } from '../dto/message-response.dto';
import { Level } from '../valueObjects/level';
import { Id } from '../valueObjects/id';
import { PersonCriteria } from '../repositories/criterions/person.criteria';
import { TopicsCriteria } from '../repositories/criterions/topics.criteria';
import { Relation } from '../entities/relation';
import { Person } from '../entities/Person';
import { NotificationService } from './notification.service';
import { LogicException } from '../exceptions/logic.exception';

@Injectable()
export class MessageService {
    constructor(
        private readonly peopleRepository: PeopleRepository,
        private readonly notificationService: NotificationService,
    ) {}

    async broadcastMessage(message: BroadcastMessage): Promise<MessageResponse> {
        if (!message.text) {
            throw new LogicException('Message text cannot be empty');
        }

        if (typeof message.text !== 'string') {
            throw new LogicException('Message text must be string');
        }

        if (!Array.isArray(message.topics)) {
            throw new LogicException('Topics must be an array of strings');
        }

        if (message.topics.length === 0) {
            throw new LogicException('Topics cannot be empty');
        }

        const text: string = message.text;
        const topics: Topic[] = message.topics.map((topic) => new Topic(topic));
        const personId = new Id(message.from_person_id);
        const minTrustLevel = new Level(message.min_trust_level);
        const person = await this.peopleRepository.findById(personId);

        if (!person) {
            throw new LogicException(`Person with id "${personId}" not found`, HttpStatus.NOT_FOUND);
        }
        const visited = new Map();
        visited.set(String(person.id), true);

        const response = await this.tracePeopleGraph(
            person,
            topics,
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

    async tracePeopleGraph(
        person: Person,
        topics: Topic[],
        minTrustLevel: Level,
        visited: Map<string, boolean>,
        visit: (person: Person) => Promise<void>,
    ): Promise<MessageResponse> {
        const isVisited = (id: Id, visited: Map<string, boolean>) => visited.has(String(id));
        const isLevelAccepted = (level, minTrustLevel: Level) => Number(level) >= Number(minTrustLevel);

        const persons = [person];
        const result: MessageResponse = {};

        while (persons.length) {
            const current = persons.shift();
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

            const siblings = await this.peopleRepository.findByCriteria([
                new PersonCriteria(siblingsId),
                new TopicsCriteria(topics),
            ]);

            siblings.forEach((s) => persons.push(s));

            if (siblings.length) {
                result[String(current.id)] = siblings.map((person) => String(person.id));
            }
        }

        return result;
    }
}
