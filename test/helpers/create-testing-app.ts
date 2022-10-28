import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from 'src/app.module';

export const createTestingApp = async (): Promise<NestFastifyApplication> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
        exports: [],
        providers: [],
    }).compile();

    const app = moduleFixture.createNestApplication<NestFastifyApplication>(
        new FastifyAdapter({ bodyLimit: 50 * 1024 * 1024 }),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    return app;
};
