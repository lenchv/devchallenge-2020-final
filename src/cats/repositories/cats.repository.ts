import { Injectable } from '@nestjs/common';
import { Criteria } from 'src/common/repositories/criteria';
import { Repository as IRepository } from 'src/common/repositories/repository';
import { Id } from 'src/common/valueObjects/id';
import { Cat } from '../entities/cat.entity';
import { CatModel } from '../models/cat.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';

@Injectable()
export class CatsRepository implements IRepository<Cat> {
    constructor(
        @InjectRepository(CatModel)
        private catsData: Repository<CatModel>,
    ) {}

    async findById(id: Id): Promise<Cat | undefined> {
        const cat = await this.catsData.findOneBy({ id: String(id) });

        if (!cat) {
            return;
        }

        return cat.toEntity();
    }

    async add(entity: Cat): Promise<Cat> {
        const catModel = CatModel.fromEntity(entity);

        await this.catsData.save(catModel);

        return entity;
    }

    async update(entity: Cat): Promise<Cat> {
        await this.catsData.update(String(entity.id), entity.toJSON());

        return entity;
    }

    async findByCriteria(criterions: Criteria<FindManyOptions>[]): Promise<Cat[]> {
        const result = await this.catsData.find(criterions.reduce((options, c) => c.query(options), {}));

        return result.map((cat) => cat.toEntity());
    }

    async delete(id: Id): Promise<void> {
        await this.catsData.delete(String(id));
    }
}
