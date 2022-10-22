import { Injectable } from '@nestjs/common';
import { Id } from 'src/valueObjects/id';
import { CatDto } from '../dto/cat.dto';
import { Cat } from '../entities/cat.entity';
import { CatsRepository } from '../repositories/cats.repository';
import { v4 as uuid } from 'uuid';
import { NotFoundException } from 'src/exceptions/not-found.exception';

@Injectable()
export class CatsService {
    constructor(private readonly catsRepository: CatsRepository) {}

    async getCat(id: Id): Promise<Cat> {
        const cat = await this.catsRepository.findById(id);

        if (!cat) {
            throw new NotFoundException('cat is not found!');
        }

        return cat;
    }

    async addCat(data: CatDto): Promise<Cat> {
        const cat = new Cat(new Id(uuid()), data.name);

        return this.catsRepository.add(cat);
    }
}
