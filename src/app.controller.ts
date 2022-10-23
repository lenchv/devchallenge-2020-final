import { Controller, Get, HttpCode } from '@nestjs/common';
import { CatsRepository } from './cats/repositories/cats.repository';

@Controller()
export class AppController {
    @Get('health')
    @HttpCode(200)
    health() {
        return { healthy: true };
    }
}
