import { Injectable } from '@nestjs/common';
import { Criteria } from 'src/common/repositories/criteria';
import { Repository as IRepository } from 'src/common/repositories/repository';
import { Id } from 'src/common/valueObjects/id';
import { Address } from '../entities/address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { AddressModel } from '../models/address.model';

@Injectable()
export class AddressesRepository implements IRepository<Address> {
    constructor(
        @InjectRepository(AddressModel)
        private data: Repository<AddressModel>,
    ) {}

    async findById(id: Id): Promise<Address | undefined> {
        const address = await this.data.findOneBy({ id: String(id) });

        if (!address) {
            return;
        }

        return address.toEntity();
    }

    async add(entity: Address): Promise<Address> {
        const address = AddressModel.fromEntity(entity);

        await this.data.save(address);

        return entity;
    }

    async update(entity: Address): Promise<Address> {
        await this.data.update(String(entity.id), entity.toJSON());

        return entity;
    }

    async findByCriteria(criterions: Criteria<FindManyOptions>[]): Promise<Address[]> {
        const result = await this.data.find(criterions.reduce((options, c) => c.query(options), {}));

        return result.map((address) => address.toEntity());
    }

    async delete(id: Id): Promise<void> {
        await this.data.delete(String(id));
    }
}
