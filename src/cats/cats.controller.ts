import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { Id } from 'src/valueObjects/id';
import { CatDto } from './dto/cat.dto';
import { CatsService } from './services/cats.service';

@Controller('cats')
export class CatsController {
    constructor(private readonly catsService: CatsService) {}

    @Get(':id')
    @HttpCode(200)
    async findById(@Param('id') id): Promise<CatDto> {
        const cat = await this.catsService.getCat(new Id(id));

        return cat.toJSON();
    }

    @Post('/')
    @HttpCode(201)
    async create(@Body() catData: CatDto): Promise<CatDto> {
        const cat = await this.catsService.addCat(catData);

        return cat.toJSON();
    }
}
