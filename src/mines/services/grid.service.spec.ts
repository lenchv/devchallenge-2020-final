import { ImageService } from './image.service';
import { Size } from '../value-objects/size';
import { GridService } from './grid.service';

const toPixel = (n) => [n, n, n, n];

describe('ImageService', () => {
    let imageService: ImageService;
    let gridService: GridService;

    beforeEach(async () => {
        imageService = new ImageService();
        gridService = new GridService(imageService);
    });

    it('should define cell size correctly', async () => {
        // prettier-ignore
        const imageData = Buffer.from([
            255, 255, 255, 255,
            255, 100, 255, 100,
        ].flatMap(toPixel));
        const cellSize = gridService.getCellSize(imageData, new Size(4, 2));

        expect(cellSize).toStrictEqual(new Size(2, 2));
    });

    it('should define cell size when columns are white correctly', async () => {
        // prettier-ignore
        const imageData = Buffer.from([
            255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 0,   255, 0,
            255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 0,   255, 0,
        ].flatMap(toPixel));
        const cellSize = gridService.getCellSize(imageData, new Size(8, 4));

        expect(cellSize).toStrictEqual(new Size(2, 2));
    });

    it('should define cell size when rows are white', async () => {
        // prettier-ignore
        const imageData = Buffer.from([
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255, 255, 255, 255, 255, 255, 255, 0,   0,   255, 0,   0,  
            255, 255, 255, 255, 255, 255, 255, 0,   0,   255, 0,   0,  
        ].flatMap(toPixel));
        const cellSize = gridService.getCellSize(imageData, new Size(12, 6));

        expect(cellSize).toStrictEqual(new Size(3, 3));
    });

    it('shoud create cell', () => {
        // prettier-ignore
        const imageData = Buffer.from([
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255,   0,   0, 255,   0,   0, 255,   0,   0, 255, 255,   0,
            255,   0,   0, 255,   0,   0, 255,   0,   0, 255, 255,   0,
            255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            255,   0,   0, 255,   0,   0, 255,   0,   0, 255,   0,   0,  
            255,   0,   0, 255,   0,   0, 255,   0,   0, 255,   0,   0,  
        ].flatMap(toPixel));
        const grid = gridService.getGrid(imageData, new Size(12, 6), new Size(3, 3));

        expect(grid.length).toBe(2);
        expect(grid[0].length).toBe(4);
        expect(grid[1].length).toBe(4);
        // prettier-ignore
        expect(grid[0].map((cell) => cell.toJSON().data)).toStrictEqual(
            [
                [ [ 100, 100 ], [ 100, 100 ] ],
                [ [ 100, 100 ], [ 100, 100 ] ],
                [ [ 100, 100 ], [ 100, 100 ] ],
                [ [ 0, 100 ], [ 0, 100 ] ]
            ]
        );
    });
});
