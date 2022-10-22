import { Id } from 'src/valueObjects/id';
import { Cat } from '../entities/cat.entity';
import { CatsRepository } from '../repositories/cats.repository';
import { CatsService } from './cats.service';

describe('CatsService', () => {
    let catsService: CatsService;
    let catsRepository: CatsRepository;

    beforeEach(async () => {
        catsRepository = new CatsRepository();
        catsService = new CatsService(catsRepository);
    });

    it('should find the cat', async () => {
        const cat1 = new Cat(new Id('1'), 'puffy');

        jest.spyOn(catsRepository, 'findById').mockImplementation(async () => new Cat(new Id('1'), 'puffy'));

        const result = await catsService.getCat(new Id('1'));

        expect(result.toJSON()).toStrictEqual(cat1.toJSON());
    });

    it('should add the cat', async () => {
        jest.spyOn(catsRepository, 'add').mockImplementation(async () => new Cat(new Id('1'), 'puffy'));

        const result = await catsService.addCat({ name: 'puffy' });

        expect(result.toJSON()).toStrictEqual({ id: '1', name: 'puffy' });
    });
});
