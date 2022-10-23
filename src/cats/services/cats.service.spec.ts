import { Id } from 'src/common/valueObjects/id';
import { Cat } from '../entities/cat.entity';
import { CatsRepository } from '../repositories/cats.repository';
import { CatsService } from './cats.service';
import { HumansService } from './humans.service';

describe('CatsService', () => {
    let catsService: CatsService;
    let catsRepository: CatsRepository;
    let humansService: HumansService;

    beforeEach(async () => {
        catsRepository = <CatsRepository>{};
        catsRepository.findById = jest.fn();
        catsRepository.add = jest.fn();
        humansService = <HumansService>{};
        catsService = new CatsService(catsRepository, humansService);
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

        expect(result.toJSON()).toStrictEqual({ id: '1', name: 'puffy', owner: null });
    });
});
