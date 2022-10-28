import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({ logger: false, bodyLimit: 50 * 1024 * 1024 }),
    );

    app.setGlobalPrefix('api');

    await app.listen(8080, '0.0.0.0');
}
bootstrap();
