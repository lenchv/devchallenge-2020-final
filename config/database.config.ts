import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export const getConfig = (configService: ConfigService): DataSourceOptions => ({
    type: 'mysql',
    host: configService.get('DB_HOST'),
    port: +configService.get('DB_PORT'),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
});
