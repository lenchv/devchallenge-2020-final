import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsRepository } from './repositories/cats.repository';
import { CatsService } from './services/cats.service';

@Module({
    imports: [],
    controllers: [CatsController],
    providers: [CatsService, CatsRepository],
})
export class CatsModule {}
