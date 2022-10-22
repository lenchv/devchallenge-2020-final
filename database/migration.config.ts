import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { getConfig } from '../config/database.config';
import { CatCreate1666434063176 } from './migrations/1666434063176-cat-create';

config();

const configService = new ConfigService();

export default new DataSource({
    ...getConfig(configService),
    entities: [],
    migrations: [CatCreate1666434063176],
});
