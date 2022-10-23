import { Injectable } from '@nestjs/common';
import { Criteria } from 'src/common/repositories/criteria';
import { Repository as IRepository } from 'src/common/repositories/repository';
import { Id } from 'src/common/valueObjects/id';
import { Human } from '../entities/human.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { HumanModel } from '../models/human.model';

@Injectable()
export class HumansRepository implements IRepository<Human> {
    constructor(
        @InjectRepository(HumanModel)
        private data: Repository<HumanModel>,
    ) {}

    async findById(id: Id): Promise<Human | undefined> {
        const human = await this.data.findOne({
            where: { id: String(id) },
            relations: { address: true },
        });

        if (!human) {
            return;
        }

        return human.toEntity();
    }

    async add(entity: Human): Promise<Human> {
        const human = HumanModel.fromEntity(entity);

        await this.data.save(human);

        return entity;
    }

    async update(entity: Human): Promise<Human> {
        await this.data.update(String(entity.id), entity.toJSON());

        return entity;
    }

    async findByCriteria(criterions: Criteria<FindManyOptions>[]): Promise<Human[]> {
        const result = await this.data.find(criterions.reduce((options, c) => c.query(options), {}));

        return result.map((human) => human.toEntity());
    }

    async delete(id: Id): Promise<void> {
        await this.data.delete(String(id));
    }
}
