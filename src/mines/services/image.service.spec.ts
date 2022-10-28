import { ImageService } from './image.service';
import { Size } from '../value-objects/size';

describe('ImageService', () => {
    let imageService: ImageService;

    beforeEach(async () => {
        imageService = new ImageService();
    });

    it('should iterate by columns correctly', async () => {
        const data = Buffer.from([
            // eslint-disable-next-line prettier/prettier
            0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3,
            4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7,
            8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 11,
            12, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15,
            16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19,
        ]);
        const columns = [];
        const size = new Size(4, 5);

        imageService.readByColumn(data, size, (column) => {
            columns.push(column.toJSON().data);
        });

        expect(columns[0]).toEqual([0, 0, 0, 0, 4, 4, 4, 4, 8, 8, 8, 8, 12, 12, 12, 12, 16, 16, 16, 16]);
        expect(columns[1]).toEqual([1, 1, 1, 1, 5, 5, 5, 5, 9, 9, 9, 9, 13, 13, 13, 13, 17, 17, 17, 17]);
        expect(columns[2]).toEqual([2, 2, 2, 2, 6, 6, 6, 6, 10, 10, 10, 10, 14, 14, 14, 14, 18, 18, 18, 18]);
        expect(columns[3]).toEqual([3, 3, 3, 3, 7, 7, 7, 7, 11, 11, 11, 11, 15, 15, 15, 15, 19, 19, 19, 19]);
    });
});
