import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { HumanInterface } from './interfaces/human.interface';
import { HumansService } from './services/humans.service';

@Controller('humans')
export class HumansController {
    constructor(private readonly humansService: HumansService) {}

    @Post('/')
    @HttpCode(201)
    async create(@Body() data: HumanInterface): Promise<HumanInterface> {
        const human = await this.humansService.add(data);

        return human.toJSON();
    }
}
