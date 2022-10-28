import { Injectable } from '@nestjs/common';
import { AppException } from 'src/mines/exceptions/app.exception';
import { Cell } from '../entities/cell.entity';
import { Pixel } from '../value-objects/pixel';
import { Size } from '../value-objects/size';
import { ImageService } from './image.service';

type Reader = (image: Buffer, size: Size, callback: (data: Buffer) => void) => void;

@Injectable()
export class GridService {
    constructor(private imageService: ImageService) {}

    getGrid(imageData: Buffer, imageSize: Size, cellSize: Size): Cell[][] {
        let rows: Pixel[][] = [];
        const grid: Cell[][] = [];
        this.imageService.readByRow(imageData, imageSize, (row: Buffer) => {
            const pixels = this.toPixels(row);
            rows.push(pixels);

            if (rows.length % cellSize.height === 0) {
                const cells = this.getCells(rows, cellSize, imageSize);
                grid.push(cells);
                rows = [];
            }
        });

        return grid;
    }

    getCellSize(imageData: Buffer, imageSize: Size): Size {
        const rows: Pixel[][][] = this.readLines(imageData, imageSize, this.imageService.readByRow);
        const columns: Pixel[][][] = this.readLines(imageData, imageSize, this.imageService.readByColumn);
        const rowSizes = this.groupAndSortByAppearance(rows.map((row) => row.length));
        const columnSizes = this.groupAndSortByAppearance(columns.map((column) => column.length));

        return this.getMostAppropriateSize(rowSizes, columnSizes);
    }

    private readLines(image: Buffer, size: Size, reader: Reader): Pixel[][][] {
        let currentLine = -1;
        const lines: Pixel[][][] = [];

        reader(image, size, (imageDataLine: Buffer): void => {
            const line = this.toPixels(imageDataLine);

            if (this.isLineWhite(line) || !lines.length) {
                lines.push([]);
                currentLine++;
            }

            lines[currentLine].push(line);
        });

        return lines;
    }

    private isLineWhite(line: Pixel[]): boolean {
        return line.every((p) => Number(p.toLevel()) === 0);
    }

    private toPixels(data: Buffer): Pixel[] {
        const result = [];

        for (let i = 0; i < data.length; i += 4) {
            result.push(new Pixel(data[i], data[i + 1], data[i + 2], data[i + 3]));
        }

        return result;
    }

    private groupAndSortByAppearance(list: number[]) {
        const hashNumbers = list.reduce((hash, n) => {
            if (!hash[n]) {
                hash[n] = 0;
            }
            hash[n]++;

            return hash;
        }, {});

        return Object.keys(hashNumbers)
            .sort((a, b) => hashNumbers[b] - hashNumbers[a])
            .map((n) => Number(n))
            .filter((n) => n > 1);
    }

    private getMostAppropriateSize(rowSizes: number[], columnSizes: number[]): Size {
        for (let i = 0; i < rowSizes.length; i++) {
            for (let j = 0; j < columnSizes.length; j++) {
                if (rowSizes[i] === columnSizes[j]) {
                    return new Size(columnSizes[j], rowSizes[i]);
                }
            }
        }

        throw new AppException(
            // eslint-disable-next-line max-len
            'Cannot detect the cells in the passed image. Please, make sure the passed image staisfies the requirements.',
        );
    }

    private getCells(rows: Pixel[][], cellSize: Size, imageSize: Size): Cell[] {
        const result: Cell[] = [];

        for (let i = 0; i < Math.ceil(imageSize.width / cellSize.width); i++) {
            const cellRows: Pixel[][] = [];

            for (let j = 1; j < rows.length; j++) {
                const cellRow = rows[j].slice(i * cellSize.width + 1, i * cellSize.width + cellSize.width);

                cellRows.push(cellRow);
            }

            result.push(new Cell(cellRows, cellSize.width - 1, cellSize.height - 1));
        }

        return result;
    }
}
