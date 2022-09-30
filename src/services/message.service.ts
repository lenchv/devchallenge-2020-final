import { Injectable } from '@nestjs/common';
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

        if (typeof message.text === 'string') {
            throw new LogicException('Message text must be string');
        }

        if (!Array.isArray(message.topics)) {
            throw new LogicException('Topics must be an array of strings');
        }

        const text: string = message.text;
        const topics: Topic[] = message.topics.map((topic) => new Topic(topic));
        const personId = new Id(message.from_person_id);
        const minTrustLevel = new Level(message.min_trust_level);
        const person = await this.peopleRepository.findById(personId);

        return this.depthFirstTracing(person, topics, minTrustLevel, [], async (recipient: Person): Promise<void> => {
            this.notificationService.send(person, recipient, text);
        });
    }

    async depthFirstTracing(
        person: Person,
        topics: Topic[],
        minTrustLevel: Level,
        visited: Id[],
        visit: (person: Person) => Promise<void>,
    ): Promise<MessageResponse> {
        const isVisited = (id: Id, visited: Id[]) => visited.some((visitedId) => visitedId.equalsTo(id));
        const isLevelAccepted = (level, minTrustLevel: Level) => Number(level) >= Number(minTrustLevel);

        const relations = person.pairs.filter(
            (relation) => isLevelAccepted(relation.trustLevel, minTrustLevel) && !isVisited(relation.id, visited),
        );
        const siblingsId = relations.map((r) => r.id);
        const newVisited = [...visited, ...siblingsId];
        const siblings = await this.peopleRepository.findByCriteria([
            new PersonCriteria(siblingsId),
            new TopicsCriteria(topics),
        ]);

        if (siblings.length === 0) {
            return {};
        }

        return siblings.reduce(
            async (prev: Promise<MessageResponse>, person: Person): Promise<MessageResponse> => {
                const result = await prev;

                await visit(person);

                return {
                    ...result,
                    ...(await this.depthFirstTracing(person, topics, minTrustLevel, newVisited, visit)),
                };
            },
            Promise.resolve({
                [String(person.id)]: siblings.map((person) => String(person.id)),
            }),
        );
    }

    async breadthFirst(relations: Relation[], topics: Topic[], minTrustLevel: Level, visited: Id[]): Promise<Person[]> {
        const personsId = relations
            .filter((r) => !visited.some((id) => r.id.equalsTo(id)))
            .map((relation) => relation.id);

        const isEmpty = personsId.length === 0;

        if (isEmpty) {
            return [];
        }

        const siblings = await this.peopleRepository.findByCriteria([
            new PersonCriteria(personsId),
            new TopicsCriteria(topics),
        ]);

        const newVisited = [...visited, ...siblings.map((p) => p.id)];
        const nextRelations = siblings.flatMap((person) => {
            return person.pairs.filter((relation) => Number(relation.trustLevel) >= Number(minTrustLevel));
        });

        const children = await this.breadthFirst(nextRelations, topics, minTrustLevel, newVisited);

        return [...siblings, ...children];
    }
}
