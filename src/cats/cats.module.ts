import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsRepository } from './repositories/cats.repository';
import { CatsService } from './services/cats.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatModel } from './models/cat.model';
import { HumanModel } from './models/human.model';
import { AddressModel } from './models/address.model';
import { HumansService } from './services/humans.service';
import { HumansRepository } from './repositories/humans.repository';
import { AddressesRepository } from './repositories/addresses.repository';
import { HumansController } from './humans.controller';

@Module({
    imports: [TypeOrmModule.forFeature([CatModel, HumanModel, AddressModel])],
    exports: [CatsRepository, HumansRepository],
    controllers: [CatsController, HumansController],
    providers: [CatsService, CatsRepository, HumansService, HumansRepository, AddressesRepository],
})
export class CatsModule {}
