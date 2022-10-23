import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { getConfig } from '../config/database.config';
import { readMigrations } from './read-migrations';

const buildDataSource = async (): Promise<DataSource> => {
    config();
    const configService = new ConfigService();
    const migrations = await readMigrations();

    return new DataSource({
        ...getConfig(configService),
        entities: [],
        migrations,
    });
};

export default buildDataSource();
