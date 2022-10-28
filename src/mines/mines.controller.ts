import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { MinesLocatorService } from './services/mines-locator.service';
import { Location } from './types/location.type';
import { MineData } from './types/mine-data.type';
import { Level } from './value-objects/level';

type Response = {
    mines: Location[];
};

@Controller()
export class MinesController {
    constructor(private readonly minesLocator: MinesLocatorService) {}

    @Post('/image-input')
    @HttpCode(200)
    async create(@Body() mineData: MineData): Promise<Response> {
        const mines = await this.minesLocator.findMines(mineData.image, new Level(mineData.min_level));

        return { mines };
    }
}
