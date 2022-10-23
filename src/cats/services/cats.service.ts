import { Injectable } from '@nestjs/common';
import { Id } from 'src/common/valueObjects/id';
import { CatInterface } from '../interfaces/cat.interface';
import { Cat } from '../entities/cat.entity';
import { CatsRepository } from '../repositories/cats.repository';
import { v4 as uuid } from 'uuid';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';
import { HumansService } from './humans.service';

@Injectable()
export class CatsService {
    constructor(private readonly catsRepository: CatsRepository, private readonly humansService: HumansService) {}

    async getCat(id: Id): Promise<Cat> {
        const cat = await this.catsRepository.findById(id);
        if (!cat) {
            throw new NotFoundException('cat is not found!');
        }

        return cat;
    }

    async addCat(data: CatInterface): Promise<Cat> {
        const cat = new Cat(new Id(uuid()), data.name);

        return this.catsRepository.add(cat);
    }

    async attachOwner(catId: Id, humanId: Id): Promise<void> {
        const cat = await this.getCat(catId);
        const human = await this.humansService.getHuman(humanId);

        cat.addOwner(human);

        await this.catsRepository.update(cat);
    }
}
