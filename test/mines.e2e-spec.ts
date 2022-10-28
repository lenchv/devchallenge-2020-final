import * as request from 'supertest';
import { createTestingApp } from './helpers/create-testing-app';
import * as fs from 'fs/promises';
import * as path from 'path';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

describe('Cats (e2e)', () => {
    let app: NestFastifyApplication;

    beforeAll(async () => {
        app = await createTestingApp();
    });

    afterAll(async () => {
        await app.close();
    });

    it('POST /image-input/ success', async () => {
        const fileData = await fs.readFile(path.join(__dirname, 'images', 'image1.png'), 'base64');

        const response = await request(app.getHttpServer())
            .post('/image-input')
            .send({ min_level: 90, image: fileData })
            .expect(200);

        expect(response.body.mines.length).toBe(90);
        // prettier-ignore
        expect(response.body.mines.map((p) => [p.x, p.y])).toStrictEqual(
            [
                [2,30],[3,30],[4,30],[5,30],[6,30],[7,30],[8,30],[9,30],[10,30],
                [2,31],[3,31],[4,31],[5,31],[6,31],[7,31],[8,31],[9,31],[10,31],
                [2,32],[3,32],[4,32],[5,32],[6,32],[7,32],[8,32],[9,32],[10,32],
                [2,33],[3,33],[4,33],[5,33],[6,33],[7,33],[8,33],[9,33],[10,33],
                [2,34],[3,34],[4,34],[5,34],[6,34],[7,34],[8,34],[9,34],[10,34],
                [2,35],[3,35],[4,35],[5,35],[6,35],[7,35],[8,35],[9,35],[10,35],
                [2,36],[3,36],[4,36],[5,36],[6,36],[7,36],[8,36],[9,36],[10,36],
                [2,37],[3,37],[4,37],[5,37],[6,37],[7,37],[8,37],[9,37],[10,37],
                [2,38],[3,38],[4,38],[5,38],[6,38],[7,38],[8,38],[9,38],[10,38],
                [2,39],[3,39],[4,39],[5,39],[6,39],[7,39],[8,39],[9,39],[10,39],
            ]
        );
        expect(response.body.mines.every((p) => p.level > 70)).toBe(true);
    });

    it('POST /image-input/ success with second image', async () => {
        const fileData = await fs.readFile(path.join(__dirname, 'images', 'image2.png'), 'base64');

        await request(app.getHttpServer())
            .post('/image-input')
            .send({ min_level: 90, image: `data:image/png;base64,${fileData}` })
            .expect(200)
            .expect({
                mines: [
                    {
                        x: 0,
                        y: 0,
                        level: 94,
                    },
                ],
            });
    });

    it('POST /image-input/ incorrect image', async () => {
        await request(app.getHttpServer())
            .post('/image-input')
            .send({ min_level: 90, image: '' })
            .expect(422)
            .expect({
                error: 'Invalid image. Make sure this is base64 encoded grayscale PNG',
                details: { message: 'Unexpected end of input' },
            });
    });

    it('POST /image-input/ incorrect min level', async () => {
        const fileData = await fs.readFile(path.join(__dirname, 'images', 'image2.png'), 'base64');
        await request(app.getHttpServer())
            .post('/image-input')
            .send({ min_level: -120, image: fileData })
            .expect(422)
            .expect({
                error: 'level must be greater or equal than 0',
                details: {},
            });
    });

    it('POST /image-input/ incorrect image color scheme', async () => {
        const fileData = await fs.readFile(path.join(__dirname, 'images', 'incorrect.png'), 'base64');
        await request(app.getHttpServer())
            .post('/image-input')
            .send({ min_level: 50, image: fileData })
            .expect(422)
            .expect({
                // eslint-disable-next-line max-len
                error: 'Cannot detect the cells in the passed image. Please, make sure the passed image staisfies the requirements.',
                details: {},
            });
    });
});
