import { Module } from '@nestjs/common';
import { MinesController } from './mines.controller';
import { GridService } from './services/grid.service';
import { ImageService } from './services/image.service';
import { MinesLocatorService } from './services/mines-locator.service';

@Module({
    imports: [],
    exports: [],
    controllers: [MinesController],
    providers: [ImageService, MinesLocatorService, GridService],
})
export class MinesModule {}
