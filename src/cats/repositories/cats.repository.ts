import { Injectable } from '@nestjs/common';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { Criteria } from 'src/common/repositories/criteria';
import { Repository } from 'src/common/repositories/repository';
import { Id } from 'src/common/valueObjects/id';
import { Cat } from '../entities/cat.entity';

@Injectable()
export class CatsRepository implements Repository<Cat> {
    private data: Cat[] = [];

    findById(id: Id): Promise<Cat> {
        return Promise.resolve(this.data.find((c) => c.id.equalsTo(id)));
    }

    add(entity: Cat): Promise<Cat> {
        this.data.push(entity);

        return Promise.resolve(entity);
    }

    update(entity: Cat): Promise<Cat> {
        const catIndex = this.data.findIndex((c) => c.id.equalsTo(entity.id));

        if (catIndex === -1) {
            throw new NotFoundException('Cat not found!');
        }

        this.data = [...this.data.slice(0, catIndex), entity, ...this.data.slice(catIndex + 1)];

        return Promise.resolve(entity);
    }

    findByCriteria(criterions: Criteria<any>[]): Promise<Cat[]> {
        throw new Error('Method not implemented.');
    }

    delete(id: Id): Promise<void> {
        this.data = this.data.filter((c) => !c.id.equalsTo(id));

        return Promise.resolve();
    }
}
