import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { PNG } from 'pngjs';
import { Size } from '../value-objects/size';
import { AppException } from '../exceptions/app.exception';

@Injectable()
export class ImageService {
    async readPng(data: string): Promise<PNG> {
        return new Promise((resolve, reject) => {
            const stream = new Readable();

            if (data.startsWith('data:image/png;base64,')) {
                data = data.replace('data:image/png;base64,', '');
            }

            stream.push(Buffer.from(data, 'base64'));
            stream.push(null);
            const imageData = new PNG({
                colorType: 0,
            });
            const imageStream = stream.pipe(imageData);
            imageStream.on('parsed', () => {
                resolve(imageData);
            });

            imageStream.on('error', (error) => {
                reject(new AppException('Invalid image. Make sure this is base64 encoded grayscale PNG', {
                    message: error.message
                }));
            });
        });
    }

    readByRow(image: Buffer, size: Size, callback: (data: Buffer) => void): void {
        const rowLength = size.width * 4;
        for (let i = 0; i < size.height; i++) {
            callback(image.slice(i * rowLength, i * rowLength + rowLength));
        }
    }

    readByColumn(image: Buffer, size: Size, callback: (data: Buffer) => void): void {
        for (let i = 0; i < size.width; i++) {
            const column = Buffer.alloc(size.height * 4);

            for (let j = 0; j < size.height; j++) {
                column.writeUInt8(image[i * 4 + size.width * 4 * j + 0], j * 4 + 0);
                column.writeUInt8(image[i * 4 + size.width * 4 * j + 1], j * 4 + 1);
                column.writeUInt8(image[i * 4 + size.width * 4 * j + 2], j * 4 + 2);
                column.writeUInt8(image[i * 4 + size.width * 4 * j + 3], j * 4 + 3);
            }

            callback(column);
        }
    }
}
