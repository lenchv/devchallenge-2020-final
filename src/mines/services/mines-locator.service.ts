import { Injectable } from '@nestjs/common';
import { Cell } from '../entities/cell.entity';
import { Location } from '../types/location.type';
import { Level } from '../value-objects/level';
import { Size } from '../value-objects/size';
import { GridService } from './grid.service';
import { ImageService } from './image.service';

@Injectable()
export class MinesLocatorService {
    constructor(private readonly imageService: ImageService, private readonly gridService: GridService) {}

    async findMines(image: string, minLevel: Level): Promise<Location[]> {
        const pngData = await this.imageService.readPng(image);
        const cellSize = this.gridService.getCellSize(pngData.data, new Size(pngData.width, pngData.height));
        const grid = this.gridService.getGrid(pngData.data, new Size(pngData.width, pngData.height), cellSize);
        const result: Location[] = [];

        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                const level = Number(this.getGrayLevel(grid[y][x]));
                if (level >= Number(minLevel)) {
                    result.push({ x, y, level });
                }
            }
        }

        return result;
    }

    private getGrayLevel(cell: Cell): Level {
        const valuesSum = cell.data
            .flatMap((row) => row.map((p) => p.toLevel()))
            .reduce((a, b) => Number(a) + Number(b), 0);

        return new Level(valuesSum / (cell.width * cell.height));
    }
}
