import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsRepository } from './repositories/cats.repository';
import { CatsService } from './services/cats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatModel } from './models/cat.model';

@Module({
    imports: [TypeOrmModule.forFeature([CatModel])],
    exports: [CatsRepository],
    controllers: [CatsController],
    providers: [CatsService, CatsRepository],
})
export class CatsModule {}
