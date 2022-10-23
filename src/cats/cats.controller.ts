import { Body, Controller, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { Id } from 'src/common/valueObjects/id';
import { CatInterface } from './interfaces/cat.interface';
import { CatsService } from './services/cats.service';

type OwnerData = {
    human: string;
};

@Controller('cats')
export class CatsController {
    constructor(private readonly catsService: CatsService) {}

    @Get(':id')
    @HttpCode(200)
    async findById(@Param('id') id: string): Promise<CatInterface> {
        const cat = await this.catsService.getCat(new Id(id));

        return cat.toJSON();
    }

    @Post('/')
    @HttpCode(201)
    async create(@Body() catData: CatInterface): Promise<CatInterface> {
        const cat = await this.catsService.addCat(catData);

        return cat.toJSON();
    }

    @Put('/:id/owner')
    @HttpCode(200)
    async attachOwner(@Param('id') catId: string, @Body() humanData: OwnerData): Promise<void> {
        await this.catsService.attachOwner(new Id(catId), new Id(humanData.human));
    }
}
