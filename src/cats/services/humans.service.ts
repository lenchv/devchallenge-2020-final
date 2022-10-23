import { Injectable } from '@nestjs/common';
import { Id } from 'src/common/valueObjects/id';
import { Address } from '../entities/address.entity';
import { Human } from '../entities/human.entity';
import { AddressInterface } from '../interfaces/address.interface';
import { HumanInterface } from '../interfaces/human.interface';
import { HumansRepository } from '../repositories/humans.repository';
import { AddressesRepository } from '../repositories/addresses.repository';
import { v4 as uuid } from 'uuid';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';

@Injectable()
export class HumansService {
    constructor(
        private readonly humansRepository: HumansRepository,
        private readonly addressesRepository: AddressesRepository,
    ) {}

    async getHuman(id: Id): Promise<Human> {
        const human = await this.humansRepository.findById(id);

        if (!human) {
            throw new NotFoundException('Human not found!');
        }

        return human;
    }

    async add(data: HumanInterface): Promise<Human> {
        const address = await this.getOrCreateAddress(data.address);
        const entity = new Human(new Id(uuid()), data.name, address);
        const human = await this.humansRepository.add(entity);

        return human;
    }

    private async getOrCreateAddress(address?: AddressInterface): Promise<Address | null> {
        if (!address) {
            return null;
        }

        if (address.id) {
            return await this.addressesRepository.findById(new Id(address.id));
        }

        const entity = new Address(new Id(uuid()), address.city, address.street, address.home);

        return await this.addressesRepository.add(entity);
    }
}
